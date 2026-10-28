
import { useEffect, useState } from "react";
import api from "./services/api";
import "./App.css";

const emptyJobForm = {
  title: "",
  company: "",
  location: "",
  type: "Internship",
  mode: "Remote",
  salary: "",
  category: "Technology",
  description: "",
};

function formatJob(job) {
  return {
    ...job,
    id: job._id,
    stipend: job.salary || "Not specified",
    icon: job.category?.toLowerCase().includes("design")
      ? "🎨"
      : job.type === "Internship"
        ? "💻"
        : "⚛️",
  };
}

function App() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [apiStatus, setApiStatus] = useState("checking");

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");

  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobForm, setJobForm] = useState(emptyJobForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const response = await api.get("/api/health");
        if (active) {
          setApiStatus(
            response.data.success ? "connected" : "error"
          );
        }
      } catch {
        if (active) setApiStatus("error");
      }

      try {
        const response = await api.get("/api/jobs");

        if (!response.data.success) {
          throw new Error("Unable to load jobs.");
        }

        if (active) {
          setJobs(response.data.data.map(formatJob));
        }
      } catch {
        if (active) {
          setJobsError("Unable to load jobs. Please try again.");
        }
      } finally {
        if (active) setJobsLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const text = [
      job.title,
      job.company,
      job.location,
      job.type,
      job.mode,
      job.category,
    ]
      .join(" ")
      .toLowerCase();

    return (
      text.includes(search.trim().toLowerCase()) &&
      (filter === "All" || job.type === filter)
    );
  });

  const scrollToJobs = () => {
    document
      .getElementById("jobs")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const selectCategory = (category) => {
    setFilter(category);
    scrollToJobs();
  };

  const updateJobField = (event) => {
    const { name, value } = event.target;

    setJobForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setEditingJobId(null);
    setJobForm({ ...emptyJobForm });
    setFormError("");
    setFormSuccess("");
    setShowJobForm(true);
    scrollToJobs();
  };

  const openEditForm = (job) => {
    setEditingJobId(job.id);
    setJobForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      type: job.type || "Internship",
      mode: job.mode || "Remote",
      salary: job.salary || "",
      category: job.category || "Technology",
      description: job.description || "",
    });
    setFormError("");
    setFormSuccess("");
    setShowJobForm(true);
    scrollToJobs();
  };

  const closeForm = () => {
    if (submitting) return;

    setShowJobForm(false);
    setEditingJobId(null);
    setJobForm({ ...emptyJobForm });
    setFormError("");
    setFormSuccess("");
  };

  const handleJobSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");
    setFormSuccess("");

    const payload = {
      ...jobForm,
      title: jobForm.title.trim(),
      company: jobForm.company.trim(),
      location: jobForm.location.trim(),
      salary: jobForm.salary.trim() || "Not specified",
      category: jobForm.category.trim() || "Other",
      description: jobForm.description.trim(),
    };

    try {
      let response;

      if (editingJobId) {
        response = await api.put(
          `/api/jobs/${editingJobId}`,
          payload
        );
      } else {
        response = await api.post("/api/jobs", payload);
      }

      if (!response.data.success || !response.data.data) {
        throw new Error("The server did not confirm the change.");
      }

      const savedJob = formatJob(response.data.data);

      if (editingJobId) {
        setJobs((previous) =>
          previous.map((job) =>
            job.id === savedJob.id ? savedJob : job
          )
        );
        setFormSuccess("Job updated successfully!");
      } else {
        setJobs((previous) => [savedJob, ...previous]);
        setFormSuccess("Job published successfully!");
      }

      setSearch("");
      setFilter("All");
      setJobForm({ ...emptyJobForm });
      setEditingJobId(null);
      setShowJobForm(false);
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          error.message ||
          "Unable to save the job. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (job) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${job.title}" at ${job.company}? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingJobId(job.id);
    setJobsError("");

    try {
      const response = await api.delete(`/api/jobs/${job.id}`);

      if (!response.data.success) {
        throw new Error("The server did not confirm deletion.");
      }

      setJobs((previous) =>
        previous.filter((item) => item.id !== job.id)
      );

      if (editingJobId === job.id) {
        closeForm();
      }

      setFormSuccess(`"${job.title}" was deleted successfully.`);
    } catch (error) {
      setJobsError(
        error.response?.data?.message ||
          "Unable to delete this job. Please try again."
      );
    } finally {
      setDeletingJobId(null);
    }
  };

  const retryLoadingJobs = async () => {
    setJobsLoading(true);
    setJobsError("");

    try {
      const response = await api.get("/api/jobs");

      if (!response.data.success) {
        throw new Error("Unable to load jobs.");
      }

      setJobs(response.data.data.map(formatJob));
    } catch {
      setJobsError("Unable to load jobs. Please try again.");
    } finally {
      setJobsLoading(false);
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <a href="#" className="brand" aria-label="JobNest home">
          <span className="brand-icon">J</span>
          JobNest<span className="brand-dot">.</span>
        </a>

        <div className="nav-links">
          <a href="#jobs">Find Jobs</a>
          <a href="#categories">Categories</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-actions">
          <button
            type="button"
            className="login-btn"
            onClick={() => alert("Login will be added later.")}
          >
            Log in
          </button>
          <button
            type="button"
            className="signup-btn"
            onClick={openAddForm}
          >
            + Add Job
          </button>
        </div>
      </nav>

      <div
        className={`api-status ${apiStatus}`}
        role="status"
        aria-live="polite"
      >
        <span className="status-dot" />
        {apiStatus === "checking" && "Connecting to server..."}
        {apiStatus === "connected" && "Server connected successfully"}
        {apiStatus === "error" &&
          "Server connection failed. Please check the backend."}
      </div>

      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">
              YOUR NEXT OPPORTUNITY STARTS HERE
            </span>
            <h1>
              Find work that
              <br />
              <span>moves you forward.</span>
            </h1>
            <p>
              Discover internships and entry-level jobs.
              Take the next step in your career with JobNest.
            </p>

            <form
              className="search-bar"
              onSubmit={(event) => {
                event.preventDefault();
                scrollToJobs();
              }}
            >
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Job title, company or location"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search jobs"
              />
              <button type="submit">Search jobs</button>
            </form>

            <div className="hero-note">
              <span aria-hidden="true">✓</span>{" "}
              Opportunities for students and freshers
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="art-circle">
              <div className="art-card">
                <span className="art-symbol">✦</span>
                <p>YOUR FUTURE</p>
                <h2>
                  Starts with
                  <br />
                  one opportunity.
                </h2>
                <div className="art-line" />
                <div className="art-small-line" />
              </div>
              <div className="floating-tag tag-one">
                <span>↗</span> New opportunities
              </div>
              <div className="floating-tag tag-two">
                <span>✓</span> Career growth
              </div>
            </div>
          </div>
        </section>

        <section className="categories" id="categories">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORE YOUR OPTIONS</span>
              <h2>Find your starting point</h2>
            </div>
            <span className="muted">
              Built for your next big move.
            </span>
          </div>

          <div className="category-grid">
            <button
              type="button"
              className="category-card"
              onClick={() => selectCategory("All")}
            >
              <span className="category-icon purple">↗</span>
              <span>
                <strong>All opportunities</strong>
                <small>Explore every opening</small>
              </span>
              <span className="arrow">→</span>
            </button>

            <button
              type="button"
              className="category-card"
              onClick={() => selectCategory("Internship")}
            >
              <span className="category-icon orange">✳</span>
              <span>
                <strong>Internships</strong>
                <small>Learn while you work</small>
              </span>
              <span className="arrow">→</span>
            </button>

            <button
              type="button"
              className="category-card"
              onClick={() => selectCategory("Full-time")}
            >
              <span className="category-icon green">⌘</span>
              <span>
                <strong>Entry-level jobs</strong>
                <small>Begin your career</small>
              </span>
              <span className="arrow">→</span>
            </button>
          </div>
        </section>

        <section className="jobs-section" id="jobs">
          <div className="section-heading">
            <div>
              <span className="eyebrow">HANDPICKED FOR YOU</span>
              <h2>Featured opportunities</h2>
            </div>

            <div className="job-heading-actions">
              <span className="muted">
                {jobsLoading
                  ? "Loading jobs..."
                  : `${filteredJobs.length} ${
                      filteredJobs.length === 1
                        ? "opportunity"
                        : "opportunities"
                    } shown`}
              </span>
              <button
                type="button"
                className="signup-btn"
                onClick={openAddForm}
              >
                + Add Job
              </button>
            </div>
          </div>

          {showJobForm && (
            <form className="job-form" onSubmit={handleJobSubmit}>
              <h3>
                {editingJobId ? "Edit job listing" : "Publish a new opportunity"}
              </h3>
              <p className="muted">
                {editingJobId
                  ? "Update the details and save your changes."
                  : "Enter the details to add a job to JobNest."}
              </p>

              {formError && (
                <p className="form-message form-error" role="alert">
                  {formError}
                </p>
              )}

              <div className="job-form-grid">
                <label>
                  Job title *
                  <input
                    name="title"
                    value={jobForm.title}
                    onChange={updateJobField}
                    required
                    maxLength={120}
                    placeholder="Frontend Developer Intern"
                  />
                </label>

                <label>
                  Company *
                  <input
                    name="company"
                    value={jobForm.company}
                    onChange={updateJobField}
                    required
                    maxLength={120}
                    placeholder="TechNova"
                  />
                </label>

                <label>
                  Location *
                  <input
                    name="location"
                    value={jobForm.location}
                    onChange={updateJobField}
                    required
                    maxLength={120}
                    placeholder="Kochi, Kerala"
                  />
                </label>

                <label>
                  Job type *
                  <select
                    name="type"
                    value={jobForm.type}
                    onChange={updateJobField}
                    required
                  >
                    <option>Internship</option>
                    <option>Full-time</option>
                    <option>Part-time</option>
                  </select>
                </label>

                <label>
                  Work mode *
                  <select
                    name="mode"
                    value={jobForm.mode}
                    onChange={updateJobField}
                    required
                  >
                    <option>Remote</option>
                    <option>Hybrid</option>
                    <option>On-site</option>
                  </select>
                </label>

                <label>
                  Salary or stipend
                  <input
                    name="salary"
                    value={jobForm.salary}
                    onChange={updateJobField}
                    maxLength={100}
                    placeholder="₹10,000/month"
                  />
                </label>

                <label>
                  Category
                  <select
                    name="category"
                    value={jobForm.category}
                    onChange={updateJobField}
                  >
                    <option>Technology</option>
                    <option>Design</option>
                    <option>Marketing</option>
                    <option>Business</option>
                    <option>Other</option>
                  </select>
                </label>

                <label className="job-description-field">
                  Description
                  <textarea
                    name="description"
                    value={jobForm.description}
                    onChange={updateJobField}
                    rows={4}
                    maxLength={3000}
                    placeholder="Describe the role..."
                  />
                </label>
              </div>

              <div className="job-form-actions">
                <button
                  type="button"
                  className="login-btn"
                  onClick={closeForm}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="signup-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editingJobId
                      ? "Save Changes"
                      : "Publish Job"}
                </button>
              </div>
            </form>
          )}

          {formSuccess && (
            <p className="form-message form-success" role="status">
              {formSuccess}
            </p>
          )}

          {jobsError && (
            <div className="empty-state" role="alert">
              <p>{jobsError}</p>
              <button
                type="button"
                className="signup-btn"
                onClick={retryLoadingJobs}
              >
                Try again
              </button>
            </div>
          )}

          <div className="filter-row">
            {["All", "Internship", "Full-time", "Part-time"].map(
              (item) => (
                <button
                  type="button"
                  key={item}
                  className={`filter-btn ${
                    filter === item ? "active" : ""
                  }`}
                  aria-pressed={filter === item}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              )
            )}
          </div>

          {jobsLoading ? (
            <div className="empty-state" role="status">
              <h3>Loading opportunities...</h3>
            </div>
          ) : (
            <>
              <div className="jobs-grid">
                {filteredJobs.map((job) => (
                  <article className="job-card" key={job.id}>
                    <div className="job-top">
                      <div className="company-icon">{job.icon}</div>
                      <span className="job-type">{job.type}</span>
                    </div>

                    <h3>{job.title}</h3>
                    <p className="company-name">{job.company}</p>

                    <div className="job-meta">
                      <span>⌖ {job.location}</span>
                      <span>◷ {job.mode}</span>
                    </div>

                    <div className="job-bottom">
                      <strong>{job.stipend}</strong>
                      <button
                        type="button"
                        className="details-btn"
                        onClick={() =>
                          alert(
                            `${job.title}\n${job.company}\n${job.location}\n\n${job.description || "No description provided."}`
                          )
                        }
                      >
                        View details →
                      </button>
                    </div>

                    <div className="job-management-actions">
                      <button
                        type="button"
                        className="edit-job-btn"
                        onClick={() => openEditForm(job)}
                        disabled={Boolean(deletingJobId)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-job-btn"
                        onClick={() => handleDeleteJob(job)}
                        disabled={Boolean(deletingJobId)}
                      >
                        {deletingJobId === job.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {filteredJobs.length === 0 && (
                <div className="empty-state">
                  <h3>
                    {jobs.length === 0
                      ? "No opportunities yet"
                      : "No opportunities found"}
                  </h3>
                  <p>
                    {jobs.length === 0
                      ? "Add a job to get started."
                      : "Try another keyword or change your filters."}
                  </p>
                  <button
                    type="button"
                    className="signup-btn"
                    onClick={() => {
                      setSearch("");
                      setFilter("All");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <section className="cta" id="about">
          <div>
            <span className="eyebrow">YOUR CAREER, YOUR WAY</span>
            <h2>
              Every great career
              <br />
              starts somewhere.
            </h2>
            <p>Make your next move with JobNest.</p>
          </div>
          <button
            type="button"
            className="cta-btn"
            onClick={scrollToJobs}
          >
            Explore opportunities →
          </button>
        </section>
      </main>

      <footer className="footer">
        <a href="#" className="brand" aria-label="JobNest home">
          <span className="brand-icon">J</span>
          JobNest<span className="brand-dot">.</span>
        </a>
        <p>Connecting talent with opportunity.</p>
        <span>
          © {new Date().getFullYear()} JobNest. Student project.
        </span>
      </footer>
    </div>
  );
}

export default App;
