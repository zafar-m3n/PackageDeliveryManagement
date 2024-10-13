const fs = require("fs");
const axios = require("axios");
const { Translate } = require("@google-cloud/translate").v2;
const textToSpeech = require("@google-cloud/text-to-speech");

const translateClient = new Translate();
const ttsClient = new textToSpeech.TextToSpeechClient();

const GOOGLE_MAPS_API_KEY = "AIzaSyAQQ9LoMLxNgfw_M42UttvGyyyK5vbr7us"; // Replace with your actual API key

// Function to calculate distance from a destination to Melbourne in kilometers
async function calculateDistanceToMelbourne(destination) {
  const melbourneCoordinates = "Melbourne";
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${melbourneCoordinates}&destinations=${destination}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await axios.get(url);
    const distanceElement = response.data.rows[0].elements[0];

    if (distanceElement.status === "OK") {
      let distanceValue = parseFloat(distanceElement.distance.text);
      if (distanceElement.distance.text.includes("mi")) {
        distanceValue = distanceValue * 1.60934; // Convert miles to kilometers
      }
      return `${distanceValue.toFixed(2)} kilometers`;
    } else {
      return `Unable to calculate distance to ${destination}`;
    }
  } catch (error) {
    return `Error calculating distance: ${error.message}`;
  }
}

// Function to translate text
async function translateText(text, targetLanguage) {
  try {
    const [translation] = await translateClient.translate(text, targetLanguage);
    return translation;
  } catch (err) {
    return `Error translating text: ${err.message}`;
  }
}

// Function to convert text to speech
async function synthesizeSpeech(text) {
  const request = {
    input: { text },
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    audioConfig: { audioEncoding: "MP3" },
  };

  try {
    const [response] = await ttsClient.synthesizeSpeech(request);
    const audioFilePath = `./output.mp3`;
    fs.writeFileSync(audioFilePath, response.audioContent, "binary");
    return audioFilePath;
  } catch (err) {
    return `Error synthesizing speech: ${err.message}`;
  }
}

// Export the functions for use in server.js
module.exports = {
  calculateDistanceToMelbourne,
  translateText,
  synthesizeSpeech,
};
