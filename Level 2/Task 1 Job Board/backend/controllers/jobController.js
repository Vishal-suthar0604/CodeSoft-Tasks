const Job = require("../models/Job");

const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find();
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching jobs" });
    }
};

const createJob = async (req, res) => {
    try {
        const { title, description, company, location, salary } = req.body;
        const newJob = new Job({ title, description, company, location, salary });
        await newJob.save();
        res.status(201).json(newJob);
    } catch (error) {
        res.status(400).json({ message: "Error creating job" });
    }
};

module.exports = { getJobs, createJob }; // Ensure functions are exported
