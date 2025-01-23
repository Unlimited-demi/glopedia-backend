const axios = require('axios');

const  Registration  = require('../models/RegisterModel');

exports.registerUser = async (req, res) => {
    try {
      const newRegistration = new Registration({
        ...req.body,
        approved: false
      });
      await newRegistration.save();
      res.status(201).json({ message: 'Registration created successfully', data: newRegistration });
    } catch (e) {
      console.error("Error during registration:", e); // Log the error on the server-side
      res.status(500).json({
        error: 'Failed to register',
        detailedError: e.message, // Send the error message
        stack: e.stack,          // Optionally send the stack trace (for development only)
      });
    }
  }

exports.getAllRegistrations = async (req, res) => {  try {    const registrations = await Registration.find({});    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

exports.approveRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Registration.findByIdAndUpdate(id, { approved: true }, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve registration' });
  }
};

