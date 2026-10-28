
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Internship", "Full-time", "Part-time"],
      required: true,
    },
    mode: {
      type: String,
      enum: ["Remote", "Hybrid", "On-site"],
      required: true,
    },
    salary: {
      type: String,
      default: "Not specified",
    },
    category: {
      type: String,
      default: "Other",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
