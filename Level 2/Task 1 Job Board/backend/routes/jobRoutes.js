const express = require("express");
const { getJobs, createJob } = require("../controllers/jobController"); // Import controllers correctly
const router = express.Router();

router.get("/", getJobs);  // Make sure getJobs is properly imported
router.post("/", createJob);  // Make sure createJob is properly imported

module.exports = router;
