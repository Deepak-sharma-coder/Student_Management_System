# Student Management System

A full-stack admin dashboard for managing students, built with the MERN stack. Admins can sign up, log in, add students with photos and marks, search and manage records, and see charts of student data on a dashboard.

## Features

- **Authentication:** signup and login with hashed passwords (bcrypt) and JWT-protected routes
- **Dashboard:** total, male and female student counts, with charts for students per batch, students per class and gender distribution, plus a recent students list
- **Add student:** name, class, batch year, gender, marks and total marks (percentage is calculated automatically), with photo upload (images only, max 2 MB)
- **Manage students:** view all students, search by name, class or batch, edit (the form opens with the old data filled in) and delete (the photo file is removed too)
- **Responsive UI:** works on phones, tablets and desktops, with a collapsible sidebar on small screens
- **Validation:** checks on both the frontend and the backend

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, React Router, Tailwind CSS, Axios, Recharts |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth and uploads | JSON Web Tokens, bcryptjs, Multer |

## Project Structure

```
student-management/
├── frontend/        # React app (Login, Signup, Dashboard, AddStudent, ManageStudents, SideBar)
└── backend/         # Express API (server.js, uploads/)
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `backend/.env` file:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/StudentManagement
JWT_SECRET=your-long-random-secret
```

Start the server:
```bash
node server.js
```
The API runs at `http://localhost:5000`.

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/signup` | Create an admin account | No |
| POST | `/api/login` | Log in and receive a JWT | No |
| POST | `/api/admin/students` | Add a student (with photo) | Yes |
| GET | `/api/admin/students` | Get all students (`?search=` to filter) | Yes |
| GET | `/api/admin/students/:id` | Get one student | Yes |
| PUT | `/api/admin/students/:id` | Update a student (photo optional) | Yes |
| DELETE | `/api/admin/students/:id` | Delete a student | Yes |

Protected routes need the header `Authorization: Bearer <token>`.

## Screenshots

_Add screenshots of the Login, Dashboard, Add Student and Manage Students pages here._

## Future Improvements

- Role-based access (admin and teacher)
- Pagination for the students list
- Export students to CSV or PDF
- Deploy the frontend and backend online

## Author

**Deepak Sharma**
GitHub: [](https://github.com/Deepak-Sharma-Coder)