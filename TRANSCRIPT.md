# Codeyoung Full Stack Assignment — Development Transcript

**Candidate Name:** Sneha Dey
**Assignment:** Codeyoung Trial Class Booking Application
**Status:** Selected Student

## 1. Project Overview

I developed a full-stack trial class booking application that allows parents or guardians to schedule trial classes for their children. The application connects a React frontend to a Node.js and Express backend, with MongoDB used to store application data.

## 2. Technologies Used

- React and Vite for the frontend
- CSS for the user interface and responsive styling
- Node.js and Express.js for the backend API
- MongoDB for database storage
- Mongoose for database models and queries
- Luxon for date and time zone handling
- GitHub and GitHub Desktop for version control

## 3. Development Process

### Frontend Development

I created a booking form to collect the parent's name, email address, child's name, preferred date, preferred time, and time zone.

I styled the interface using CSS, with a purple theme, improved form spacing, readable labels, and responsive layouts.

The frontend retrieves active mentors from the backend and sends booking requests to the booking API.

### Backend Development

I created an Express server with endpoints for checking server health, retrieving active mentors, and creating bookings.

The backend validates booking information, checks mentor availability, assigns an eligible mentor, and returns a booking confirmation.

### Database Integration

I connected the backend to MongoDB using Mongoose.

The database stores mentor information, parent details, and booking records.

### Time Zone Handling

I used Luxon to interpret the selected date and time in the parent's chosen time zone and convert it to UTC for storage. The application also returns the scheduled time in the mentor's time zone.

### Booking Confirmation

After a successful booking, the frontend displays the student's name, assigned mentor, mentor email, booking status, local times, and demo class link.

## 4. Testing and Verification

The following checks should be recorded according to the results actually observed:

- [x] Backend health endpoint responds successfully.
- [x] Active mentors are retrieved from the backend.
- [x] A booking was submitted through the frontend.
- [x] The booking was saved in MongoDB.
- [x] Verify overlapping booking prevention.
- [x] Verify the maximum of two confirmed classes per mentor per day.
- [x] Verify time zone conversions for different regions.
- [ ] Verify daylight saving time edge cases.
- [ ] Verify the no-available-mentor error response.

Items marked as incomplete should be checked before final submission.

## 5. Version Control

I created a GitHub repository and uploaded the project source code using GitHub Desktop. I also added a README file describing the project, technologies, setup instructions, and API endpoints.

**Repository:** [https://github.com/SnehaDey-01/codeyoung-trial-booking](https://github.com/SnehaDey-01/codeyoung-trial-booking)

## 6. Challenges and Learning

During development, I worked on connecting the frontend to the backend, storing booking information in MongoDB, improving the user interface, and preparing the project for version control.

This project helped me practise full-stack application development, REST API integration, database operations, time zone handling, and GitHub workflows.

## 7. Conclusion

The project demonstrates a full-stack trial class booking workflow using React, Express, and MongoDB. Further improvements could include email notifications, automated tests, and production deployment.
