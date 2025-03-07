import express from "express";
import "dotenv/config";
import cors from "cors"; // Import CORS

import connectDB from "./config/mongodb.js";
import chatRoutes from "./controllers/routes.js"; // Ensure this import is correct

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4000;
connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "https://cryto-pal.vercel.app",
  process.env.CLIENT_URL,
];
// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.get("/", (req, res) => res.send("API Working"));
// Routes
app.use("/api/chat", chatRoutes); // Use the correct variable

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
