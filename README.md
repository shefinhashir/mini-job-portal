# JobNest — Mini Job & Internship Portal

## Project Overview
JobNest is a MERN Stack web application designed to help users explore job and internship opportunities through a simple, responsive interface.

## Features
- Browse job and internship listings
- Search and filter opportunities
- Add new job listings
- Edit and delete job listings
- MongoDB database integration
- React frontend with an Express and Node.js backend

## Technology Stack
- **Frontend:** React, Vite, CSS, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas, Mongoose
- **Version Control:** Git and GitHub

## Project Structure
- `client/` — React frontend
- `server/` — Express backend and database models

## Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/shefinhashir/mini-job-portal.git
cd mini-job-portal
```

### 2. Configure the backend
Navigate to `server/`, install dependencies, and create a `.env` file using `server/.env.example` as a reference.

Required environment variables:
- `PORT`
- `CLIENT_URL`
- `MONGODB_URI`
- `JWT_SECRET`

### 3. Configure the frontend
Navigate to `client/`, install dependencies, and configure `VITE_API_URL` in your local `.env` file.

### 4. Run the application
Start the backend and frontend in separate terminals using their development scripts.

## Security
Environment variables and database credentials should remain private and must not be committed to the repository.

## Testing
The main job-management features have been checked locally. Additional authentication, authorization, and deployment testing may still be required.

## Limitations and Future Improvements
- Complete and integrate user registration and login.
- Protect job-management endpoints with authentication and authorization.
- Deploy the frontend and backend.
- Add more comprehensive validation and automated tests.

## Repository
https://github.com/shefinhashir/mini-job-portal
