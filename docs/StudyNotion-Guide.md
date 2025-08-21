# StudyNotion Project Guide

This document explains the full flow for every role, all backend routes and their purposes, database models, authentication/authorization, frontend flows, and core packages used.

## Overview
- Backend: Node.js, Express, MongoDB (Mongoose), JWT auth (cookies), Cloudinary uploads.
- Frontend: React, Redux Toolkit, Axios, Tailwind.
- Roles: Student, Instructor, Admin.

## Server Entrypoint
- File: `server/index.js`
  - CORS origin: `http://localhost:3000`
  - Routes mounted:
    - `/api/v1/auth` → `server/routes/User.js`
    - `/api/v1/profile` → `server/routes/Profile.js`
    - `/api/v1/course` → `server/routes/Course.js`
    - `/api/v1/payment` → `server/routes/Payments.js`
    - `/api/v1/reach` → `server/routes/Contact.js`
  - Middleware: `cookie-parser`, `cors`, `express.json`, `express-fileupload`, `cloudinaryConnect()`

## Authentication & Password (Backend)
- File: `server/controllers/Auth.js`
  - `POST /api/v1/auth/signup` — Validates OTP (`OTP`), hashes password, creates `Profile` + `User` with a default profile image.
  - `POST /api/v1/auth/login` — Issues JWT `{ email, id, role }` as httpOnly cookie.
  - `POST /api/v1/auth/sendotp` — Generates OTP; saves to `OTP` collection.
  - `POST /api/v1/auth/changepassword` — (auth) Verifies old password, sets new one, sends email.
- File: `server/controllers/ResetPassword.js`
  - `POST /api/v1/auth/reset-password-token` — Sends reset link with token.
  - `POST /api/v1/auth/reset-password` — Verifies token and updates password.
- Middleware: `server/middlewares/auth.js`
  - `auth` — Verifies JWT, sets `req.user`.
  - `isStudent` / `isInstructor` / `isAdmin` — Role-based guards using `req.user`.

## Profile (Backend)
- File: `server/routes/Profile.js`
  - `DELETE /api/v1/profile/deleteProfile` (auth)
  - `PUT /api/v1/profile/updateProfile` (auth)
  - `PUT /api/v1/profile/updateDisplayPicture` (auth)
  - `GET /api/v1/profile/getUserDetails` (auth)
  - `GET /api/v1/profile/getEnrolledCourses` (auth)
  - `GET /api/v1/profile/instructorDashboard` (auth + isInstructor)

## Courses, Sections, Reviews (Backend)
- File: `server/routes/Course.js` (controllers under `server/controllers/*`)
  - Public reads
    - `GET /api/v1/course/getAllCourses`
    - `POST /api/v1/course/getCourseDetails`
    - `GET /api/v1/course/showAllCategories`
    - `POST /api/v1/course/getCategoryPageDetails`
  - Course authoring (auth + isInstructor)
    - `POST /api/v1/course/createCourse`
    - `POST /api/v1/course/editCourse`
    - `DELETE /api/v1/course/deleteCourse`
    - `GET /api/v1/course/getInstructorCourses`
  - Sections (auth + isInstructor)
    - `POST /api/v1/course/addSection`
    - `POST /api/v1/course/updateSection`
    - `POST /api/v1/course/deleteSection`
  - Subsections (auth + isInstructor)
    - `POST /api/v1/course/addSubSection`
    - `POST /api/v1/course/updateSubSection`
    - `POST /api/v1/course/deleteSubSection`
  - Enrolled-only
    - `POST /api/v1/course/getFullCourseDetails` (auth)
    - `POST /api/v1/course/updateCourseProgress` (auth + isStudent)
  - Ratings & reviews
    - `POST /api/v1/course/createRating` (auth + isStudent)
    - `GET /api/v1/course/getAverageRating`
    - `GET /api/v1/course/getReviews`

## Payments (Backend)
- File: `server/routes/Payments.js`
  - `POST /api/v1/payment/capturePayment` (auth + isStudent) — Creates Razorpay order.
  - `POST /api/v1/payment/verifyPayment` (auth + isStudent) — Verifies signature; enrolls user.
  - `POST /api/v1/payment/sendPaymentSuccessEmail` (auth + isStudent) — Sends receipt email.

## Contact (Backend)
- File: `server/routes/Contact.js`
  - `POST /api/v1/reach/contact` — Contact form email via `server/controllers/ContactUs.js`.

## Database Models
- File: `server/models/User.js`
  - `firstName`, `lastName`, `email`, `password`(hashed), `accountType`("Admin"|"Student"|"Instructor"), `image`, `courses[]`, `additionalDetails`→`Profile`, `courseProgress[]`, `token`.
- File: `server/models/Profile.js`
  - `gender`, `dateOfBirth`, `about`, `contactNumber` — Referenced by `User.additionalDetails`.
- File: `server/models/Course.js`
  - `courseName`, `courseDescription`, `instructor`→`User`, `whatYouWillLearn`, `courseContent`→`Section[]`, `ratingAndReviews`→`RatingAndReview[]`, `price`, `thumbnail`, `tag[]`, `category`→`Category`, `studentsEnrolled[]`, `instructions[]`, `status`.
- File: `server/models/Section.js`
  - `sectionName`, `subSection[]`→`SubSection`.
- File: `server/models/SubSection.js`
  - Typical fields: `title`, `description`, `timeDuration`, `videoUrl` — referenced by `Section`.
- File: `server/models/Category.js`
  - `name`, `description` — referenced by `Course.category`.
- File: `server/models/RatingAndRaview.js` (typo in filename)
  - `user`→`User`, `course`→`Course`, `rating`, `review`.
- File: `server/models/CourseProgress.js`
  - `userId`→`User`, `courseId`→`Course`, `completedVideos[]`.
- File: `server/models/OTP.js`
  - `email`, `otp`, `createdAt` — used in signup verification.

## Frontend Structure & Flows
- API setup
  - `src/.env` → `REACT_APP_BASE_URL=http://localhost:4000/api/v1`.
  - `src/services/apiconnector.js` — Axios instance with `withCredentials`.
  - `src/services/apis.js` — Endpoint constants.
  - `src/services/operations/*API.js` — Thunks for auth, settings, course operations.
- Auth
  - `src/services/operations/authAPI.js` — `sendOtp`, `signup`, `login`, `logout`.
  - After login, default avatar if `user.image` is empty; user saved to Redux + localStorage.
  - UI components: Login/Signup pages, `src/components/core/Auth/ProfileDropDown.jsx`.
- Settings & Profile
  - `src/services/operations/SettingsAPI.js` — `updateDisplayPicture`, `updateProfile`, `changePassword`, `deleteProfile`.
  - UI: `src/components/core/Dashboard/Settings/*`.
- Catalog & Course Details
  - `src/components/common/Navbar.jsx` — Loads categories from `/course/showAllCategories`.
  - `src/pages/Home.jsx`, `src/pages/CourseDetails.jsx`, `src/components/core/Catalog/Course_Card.jsx` (displays dynamic "Add to Cart" or "Go to Course" buttons).
  - Ratings UI: `src/components/common/RatingStars.jsx`, `src/components/common/ReviewSlider.jsx`.
- Learning
  - `src/pages/ViewCourse.jsx`, `src/components/core/ViewCourse/*` — Player, sidebar, review modal.
  - Progress via `POST /course/updateCourseProgress`.

## Role Flows (Step-by-step)
- Student
  1) Sign up (OTP), log in → receives JWT cookie.
  2) Browse catalog → view course details and reviews.
  3) Purchase → Razorpay order and verification; gets enrolled.
  4) Learn → watch videos, track progress.
  5) Review → create rating + review.
- Instructor
  1) Log in as Instructor.
  2) Create course → add sections and subsections (videos).
  3) Publish and manage courses.
  4) View instructor dashboard for metrics.
- Admin
  1) Log in as Admin.
  2) Manage categories.

## Authentication & Authorization (Plain-English)
- Logging in gives a signed token (JWT) saved as a secure cookie.
- Each protected request checks that token (`auth` middleware).
- Role middlewares (`isStudent`, `isInstructor`, `isAdmin`) ensure only the right roles can do specific actions.

## Packages (Why they’re used)
- Server (`server/package.json`)
  - `express` — HTTP server and routing
  - `mongoose` — MongoDB ODM
  - `jsonwebtoken` — JWT-based authentication
  - `cookie-parser` — Read/write cookies
  - `cors` — Cross-origin calls from React app
  - `express-fileupload` + `cloudinary` — Upload and store media
  - `nodemailer` — Emails (OTP, password, receipts)
  - `otp-generator` — OTP creation
  - `razorpay` — Payments
  - `dotenv` — Environment variables
- Client (`package.json`)
  - `react`, `react-router-dom` — SPA
  - `@reduxjs/toolkit`, `react-redux` — State management
  - `axios` — HTTP client
  - `react-hot-toast` — Notifications
  - `react-hook-form` — Forms
  - `react-icons` — Icons
  - `swiper` — Sliders
  - `video-react` — Video player
  - `chart.js`, `react-chartjs-2` — Charts
  - `tailwindcss` — Styling

## Environment
- Client: `src/.env` → `REACT_APP_BASE_URL`
- Server: `server/.env` → `MONGODB_URL`, `JWT_SECRET`, Cloudinary, Razorpay keys, `PORT`.
- CORS: origin `http://localhost:3000` in `server/index.js`.

## Dev Utilities
- Seed sample reviews: `server/scripts/seedReviews.js` → `npm run seed:reviews` from `server/`.

---
This guide covers both backend and frontend for technical and non-technical readers. Open `public/guide.html` in the browser to print as PDF.
