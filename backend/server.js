
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { DateTime } = require("luxon");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
  })
);

app.use(express.json());

app.use(express.json());

// -------------------- DATABASE MODELS --------------------

const mentorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    timezone: { type: String, default: "Asia/Kolkata" },
    isActive: { type: Boolean, default: true },
  },
  { collection: "mentors", strict: false }
);

const parentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
  },
  { collection: "parents", timestamps: true }
);

const bookingSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      required: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      required: true,
    },
    childName: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    parentTimezone: { type: String, required: true },
    mentorTimezone: { type: String, required: true },
    classLink: { type: String, required: true },
    status: {
      type: String,
      default: "confirmed",
    },
  },
  { collection: "bookings", timestamps: true }
);

const Mentor = mongoose.model("Mentor", mentorSchema);
const Parent = mongoose.model("Parent", parentSchema);
const Booking = mongoose.model("Booking", bookingSchema);

// -------------------- BASIC ROUTES --------------------

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Codeyoung API is running",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

app.get("/api/mentors", async (req, res) => {
  try {
    const mentors = await Mentor.find({ isActive: true })
      .select("name email timezone")
      .lean();

    res.json({
      success: true,
      count: mentors.length,
      mentors,
    });
  } catch (error) {
    console.error("Mentor lookup failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch mentors.",
    });
  }
});

// -------------------- BOOKING ROUTE --------------------

// Serialize booking requests in this Node.js process so two
// simultaneous requests cannot both take the same available capacity.
let bookingQueue = Promise.resolve();

app.post("/api/bookings", async (req, res) => {
  const performBooking = async () => {
    const {
      parentName,
      email,
      childName,
      date,
      time,
      timezone,
    } = req.body;

    // Validate required fields.
    if (
      !parentName?.trim() ||
      !email?.trim() ||
      !childName?.trim() ||
      !date ||
      !time ||
      !timezone
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
      });
    }

    // Validate the parent's IANA time-zone identifier.
    const validZones = [
      "Asia/Kolkata",
      "America/New_York",
      "America/Los_Angeles",
      "Europe/London",
    ];

    if (!validZones.includes(timezone)) {
      return res.status(400).json({
        success: false,
        message: "Please select a supported time zone.",
      });
    }

    // Interpret the selected date and time as the parent's local time.
    const localInput = `${date}T${time}`;

    const parentStart = DateTime.fromISO(localInput, {
      zone: timezone,
    });

    // Reject invalid dates and nonexistent times during a DST change.
    if (
      !parentStart.isValid ||
      parentStart.toFormat("yyyy-MM-dd'T'HH:mm") !== localInput
    ) {
      return res.status(400).json({
        success: false,
        message:
          "That local time is invalid because of a time-zone or daylight-saving change. Please choose another time.",
      });
    }

    if (parentStart.toMillis() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Please choose a future date and time.",
      });
    }

    const startTime = parentStart.toUTC().toJSDate();
    const endTime = parentStart.plus({ hours: 1 }).toUTC().toJSDate();

    try {
      const mentors = await Mentor.find({ isActive: true })
        .sort({ name: 1 })
        .lean();

      if (mentors.length === 0) {
        return res.status(503).json({
          success: false,
          message:
            "No mentors are currently available. Please try again later.",
        });
      }

      let selectedMentor = null;

      // Assign the first mentor with capacity and no overlapping class.
      for (const mentor of mentors) {
        const mentorZone = mentor.timezone || "Asia/Kolkata";

        const mentorStart = DateTime.fromJSDate(startTime, {
          zone: "utc",
        }).setZone(mentorZone);

        const dayStart = mentorStart.startOf("day").toUTC().toJSDate();
        const dayEnd = mentorStart
          .startOf("day")
          .plus({ days: 1 })
          .toUTC()
          .toJSDate();

        // Count this mentor's classes on their own local calendar day.
        const dailyCount = await Booking.countDocuments({
          mentorId: mentor._id,
          status: "confirmed",
          startTime: { $gte: dayStart, $lt: dayEnd },
        });

        if (dailyCount >= 2) {
          continue;
        }

        // Reject any time interval that overlaps an existing class.
        const overlappingBooking = await Booking.findOne({
          mentorId: mentor._id,
          status: "confirmed",
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        }).lean();

        if (overlappingBooking) {
          continue;
        }

        selectedMentor = {
          ...mentor,
          timezone: mentorZone,
        };
        break;
      }

      if (!selectedMentor) {
        return res.status(409).json({
          success: false,
          message:
            "Sorry, no mentors are available at that time. Please choose another date or time.",
        });
      }

      // Create or update the parent record.
      const parent = await Parent.findOneAndUpdate(
        { email: email.trim().toLowerCase() },
        {
          $set: {
            name: parentName.trim(),
            email: email.trim().toLowerCase(),
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      // Store class times as UTC instants in MongoDB.
      const booking = await Booking.create({
        parentId: parent._id,
        mentorId: selectedMentor._id,
        childName: childName.trim(),
        startTime,
        endTime,
        parentTimezone: timezone,
        mentorTimezone: selectedMentor.timezone,
        classLink: "https://example.com/demo-class",
        status: "confirmed",
      });

      // Return each person's class time in their own time zone.
      const mentorLocalStart = DateTime.fromJSDate(startTime, {
        zone: "utc",
      }).setZone(selectedMentor.timezone);

      const mentorLocalEnd = DateTime.fromJSDate(endTime, {
        zone: "utc",
      }).setZone(selectedMentor.timezone);

      return res.status(201).json({
        success: true,
        message: "Your trial class has been booked successfully!",
        booking: {
          id: booking._id,
          childName: booking.childName,
          status: booking.status,
          classLink: booking.classLink,
          parent: {
            name: parent.name,
            email: parent.email,
            timezone,
            startTime: parentStart.toISO(),
            endTime: parentStart.plus({ hours: 1 }).toISO(),
          },
          mentor: {
            name: selectedMentor.name,
            email: selectedMentor.email,
            timezone: selectedMentor.timezone,
            startTime: mentorLocalStart.toISO(),
            endTime: mentorLocalEnd.toISO(),
          },
          startTimeUTC: startTime.toISOString(),
          endTimeUTC: endTime.toISOString(),
        },
      });
    } catch (error) {
      console.error("Booking creation failed:", error);

      return res.status(500).json({
        success: false,
        message: "We could not create your booking. Please try again.",
      });
    }
  };

  // Keep booking operations in order in this server process.
  const currentRequest = bookingQueue.then(performBooking);
  bookingQueue = currentRequest.then(
    () => undefined,
    () => undefined
  );

  try {
    await currentRequest;
  } catch (error) {
    console.error("Unexpected booking error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred. Please try again.",
      });
    }
  }
});

// -------------------- UNKNOWN ROUTES --------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// -------------------- START SERVER --------------------

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from your .env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully");
    console.log("Database:", mongoose.connection.name);

    const port = process.env.PORT || 5000;

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Startup error:", error.message);
    process.exit(1);
  }
}

startServer();
