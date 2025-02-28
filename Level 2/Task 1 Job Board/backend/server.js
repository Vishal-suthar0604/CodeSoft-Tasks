const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");


// Load environment variables before using them
dotenv.config();

// Connect to MongoDB
connectDB("mongodb+srv://vishalsuthar2711:ppGd8JapukNMFxGt@jobbored.ex7vx.mongodb.net/?retryWrites=true&w=majority&appName=Jobbored");

const app = express();
app.use(express.json());
app.use(cors());

// Routes
const jobRoutes = require("./routes/jobRoutes");
app.use("/api/jobs", jobRoutes);

// Port configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
