const mongoose = require("mongoose");
const Schema = mongoose.Schema;

function generateDriverId() {
  const randomLetters = () =>
    Math.random().toString(36).substring(2, 5).toUpperCase();
  const studentIdDigits = "34";
  return `D${Math.floor(
    Math.random() * 90 + 10
  )}-${studentIdDigits}-${randomLetters()}`;
}

// Define the Driver Schema
const driverSchema = new Schema({
  driver_id: {
    type: String,
    default: generateDriverId,
    unique: true,
  },
  driver_name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
  },
  driver_department: {
    type: String,
    required: true,
    enum: ["food", "furniture", "electronics"],
  },
  driver_licence: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 5,
    match: /^[A-Za-z0-9]{5}$/,
  },
  driver_isActive: {
    type: Boolean,
    default: true,
  },
  assigned_packages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
    },
  ],
  driver_createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Driver = mongoose.model("Driver", driverSchema);

module.exports = Driver;
