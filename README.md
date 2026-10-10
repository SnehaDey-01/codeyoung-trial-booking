# Codeyoung Trial Class Booking Application

**Developed by:** Sneha Dey  
**Status:** Selected Student — Full Stack Assignment

## About the Project

The Codeyoung Trial Class Booking Application is a full-stack web application designed to help parents schedule trial classes for their children. It provides a simple booking interface and connects to a backend API that manages mentor information and booking records.

## Features

- **Parent and Student Details:** Collects parent or guardian name, email address, and child's name.
- **Mentor Management:** Retrieves active mentors from the backend.
- **Automatic Mentor Assignment:** Assigns an available mentor to a trial class.
- **Date and Time Selection:** Allows parents to choose their preferred date, time, and time zone.
- **Time Zone Handling:** Uses time zone-aware scheduling to represent booking times for parents and mentors.
- **Booking Validation:** Checks booking information and mentor availability.
- **Daily Booking Limit:** Supports a maximum of two confirmed classes per mentor per day.
- **Booking Confirmation:** Displays the assigned mentor, booking status, and demo class link.
- **Database Integration:** Stores parent, mentor, and booking information in MongoDB.
- **Responsive User Interface:** Provides a styled booking form for desktop and mobile screens.

## Technologies Used

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| Vite | Frontend development server |
| CSS | Styling and responsive design |
| Node.js | Backend runtime |
| Express.js | REST API |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| Luxon | Date and time zone handling |
| dotenv | Environment configuration |

## Project Structure

```text
codeyoung-trial-booking/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── index.html
├── backend/
│   ├── server.js
│   └── package.json
├── .gitignore
├── README.md
└── TRANSCRIPT.md
```

## Prerequisites

Before running the application, install:

- Node.js and npm
- MongoDB Community Server, running locally
- Git (optional, for version control)

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/SnehaDey-01/codeyoung-trial-booking.git
cd codeyoung-trial-booking
```

### 2. Configure the backend

Open a terminal in the `backend` directory:

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` with the following local development settings:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/codeyoung_booking
CLIENT_URL=http://localhost:5173
```

Make sure MongoDB is running on your computer.

Start the backend:

```bash
npm run dev
```

The backend API should be available at:

`http://localhost:5000`

Health-check endpoint:

`http://localhost:5000/api/health`

### 3. Configure the frontend

Open a second terminal in the project directory and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Checks backend and database connectivity |
| GET | `/api/mentors` | Retrieves active mentors |
| POST | `/api/bookings` | Validates and creates a trial class booking |

## Database Collections

The application uses the `codeyoung_booking` MongoDB database with these collections:

- `mentors` — mentor details and active status
- `parents` — parent or guardian details
- `bookings` — booking time, assigned mentor, time zones, status, and class link

## Security Notes

- Environment variables and credentials must remain in the local `.env` file.
- The `.env` file must not be committed to GitHub.
- `node_modules` and generated build files should be excluded from version control.
- The demo class URL is a placeholder for demonstration purposes.

## Future Improvements

- Email notifications for parents and mentors
- A calendar interface showing available time slots
- Automated tests for scheduling, time zones, and booking limits
- Deployment to a production hosting platform

## Author

**Sneha Dey**  
Selected Student — Full Stack Assignment

GitHub Repository:  
https://github.com/SnehaDey-01/codeyoung-trial-booking

---

*This project was developed as part of a full-stack application assignment.*
