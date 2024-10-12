const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Function to generate a custom package ID
function generatePackageId() {
  const randomChars = () =>
    Math.random().toString(36).substring(2, 4).toUpperCase();
  const randomDigits = () => Math.floor(Math.random() * 900 + 100);
  const initials = "DA";
  return `P${randomChars()}-${initials}-${randomDigits()}`;
}

// Define the Package Schema
const packageSchema = new Schema({
  package_id: {
    type: String,
    default: generatePackageId,
    unique: true,
  },
  package_title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 15,
  },
  package_weight: {
    type: Number,
    required: true,
    min: 1,
  },
  package_destination: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 15,
    match: /^[A-Za-z0-9]{5,15}$/,
  },
  description: {
    type: String,
    maxlength: 30,
  },
  isAllocated: {
    type: Boolean,
    default: false,
  },
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Package = mongoose.model("Package", packageSchema);

module.exports = Package;
