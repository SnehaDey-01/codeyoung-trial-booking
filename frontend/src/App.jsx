

import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
  { value: "America/New_York", label: "US Eastern Time" },
  { value: "America/Los_Angeles", label: "US Pacific Time" },
  { value: "Europe/London", label: "UK Time" },
];

const TIME_SLOTS = ["10:00", "11:00", "14:00", "16:00", "18:00"];

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function App() {
  const [mentors, setMentors] = useState([]);
  const [apiMessage, setApiMessage] = useState("Connecting to server...");
  const [loadingMentors, setLoadingMentors] = useState(true);

  const [formData, setFormData] = useState({
    parentName: "",
    email: "",
    childName: "",
    date: "",
    time: "",
    timezone: "America/New_York",
  });

  const [message, setMessage] = useState("");
  const [bookingResult, setBookingResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMentors() {
      try {
        const response = await fetch(`${API_URL}/mentors`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load mentors."
          );
        }

        if (isMounted) {
          setMentors(data.mentors || []);
          setApiMessage(
            `Connected successfully! ${data.count} active mentors loaded.`
          );
        }
      } catch (error) {
        console.error("Mentor API error:", error);

        if (isMounted) {
          setApiMessage(
            "Could not connect to the backend. Please check that your server is running."
          );
        }
      } finally {
        if (isMounted) {
          setLoadingMentors(false);
        }
      }
    }

    loadMentors();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setBookingResult(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setBookingResult(null);

    if (
      !formData.parentName.trim() ||
      !formData.email.trim() ||
      !formData.childName.trim() ||
      !formData.date ||
      !formData.time ||
      !formData.timezone
    ) {
      setMessage("Please complete all fields before continuing.");
      return;
    }

    if (formData.date < getToday()) {
      setMessage("Please select today or a future date.");
      return;
    }

    if (loadingMentors || mentors.length === 0) {
      setMessage(
        "No mentors are available right now. Please try again later."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          parentName: formData.parentName.trim(),
          email: formData.email.trim(),
          childName: formData.childName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to book your trial class."
        );
      }

      setBookingResult(data.booking);
      setMessage(
        data.message || "Your trial class has been booked successfully!"
      );
    } catch (error) {
      console.error("Booking error:", error);
      setMessage(
        error.message ||
          "Unable to complete your booking. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="booking-page">
      <section className="booking-card">
        <div className="booking-header">
          <div className="brand-mark">C</div>
          <p className="eyebrow">CODEYOUNG · LIVE LEARNING</p>
          <h1>Book a free trial class</h1>
          <p className="subtitle">
            Meet your mentor and discover a world of coding and creativity.
          </p>
        </div>

        <div
          className={`api-status ${
            mentors.length > 0
              ? "api-status-success"
              : "api-status-neutral"
          }`}
          role="status"
        >
          <span className="status-dot" />
          {loadingMentors ? "Connecting to server..." : apiMessage}
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-section-heading">
            <span className="section-number">01</span>
            <div>
              <h2>Parent and student details</h2>
              <p>Tell us who will be joining the trial class.</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="parentName">Parent or guardian name</label>
            <input
              id="parentName"
              name="parentName"
              type="text"
              placeholder="Enter your full name"
              value={formData.parentName}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="childName">Child's name</label>
            <input
              id="childName"
              name="childName"
              type="text"
              placeholder="Enter your child's name"
              value={formData.childName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-section-heading schedule-heading">
            <span className="section-number">02</span>
            <div>
              <h2>Choose your preferred time</h2>
              <p>Choose a date, time, and your local time zone.</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="timezone">Your time zone</label>
            <select
              id="timezone"
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              required
            >
              {TIMEZONES.map((timezone) => (
                <option key={timezone.value} value={timezone.value}>
                  {timezone.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Preferred date</label>
              <input
                id="date"
                name="date"
                type="date"
                min={getToday()}
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Preferred time</label>
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              >
                <option value="">Select time</option>
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="timezone-note">
            <span aria-hidden="true">◷</span>
            Times are entered in the time zone you selected above.
          </div>

          <div className="mentor-summary">
            <div className="mentor-icon" aria-hidden="true">
              ✦
            </div>
            <div>
              <strong>Expert mentor matching</strong>
              <p>
                {loadingMentors
                  ? "Checking available mentors..."
                  : mentors.length > 0
                    ? `${mentors.length} active mentors available for automatic matching.`
                    : "No mentors could be loaded. Please try again later."}
              </p>
            </div>
          </div>

          {message && (
            <div
              className="form-message"
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          )}

          {bookingResult && (
            <div className="booking-confirmation" role="status">
              <h2>Booking confirmed!</h2>

              <p>
                <strong>Student:</strong> {bookingResult.childName}
              </p>

              <p>
                <strong>Mentor:</strong> {bookingResult.mentor.name}
              </p>

              <p>
                <strong>Mentor email:</strong>{" "}
                {bookingResult.mentor.email}
              </p>

              <p>
                <strong>Your local time:</strong>{" "}
                {bookingResult.parent.startTime}
              </p>

              <p>
                <strong>Mentor's local time:</strong>{" "}
                {bookingResult.mentor.startTime}
              </p>

              <p>
                <strong>Status:</strong> {bookingResult.status}
              </p>

              <p>
                <strong>Demo class link:</strong>{" "}
                <a
                  href={bookingResult.classLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Join demo class
                </a>
              </p>
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={submitting || loadingMentors || mentors.length === 0}
          >
            {submitting ? "Booking your class..." : "Continue to book"}
            <span aria-hidden="true">→</span>
          </button>

          <p className="privacy-note">
            Your information will be used to arrange your trial class.
          </p>
        </form>
      </section>

      <footer className="page-footer">
        Made for curious minds <span aria-hidden="true">✦</span> Powered by
        learning
      </footer>
    </main>
  );
}

export default App;
