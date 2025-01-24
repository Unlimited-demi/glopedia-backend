
const mongoose = require('mongoose')

const registrationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  lga: {
    type: String,
    required: true
  },
  program: {
    type: String,
    required: true
  },
  sponsorName: String,
  sponsorPhone: String,
  experience: String,
  date: {
    type: Date,
    required: true
  },
  signature: {
    type: String,
    required: true
  },
  paymentComplete: {
    type: Boolean,
    default: false
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  approved: {
    type: Boolean,
    default: false
  }}
)


module.exports  = mongoose.model('Registration', registrationSchema)