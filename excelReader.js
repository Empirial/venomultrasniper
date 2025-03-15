import { Storage } from '@google-cloud/storage';
import xlsx from 'xlsx';

// Initialize Google Cloud Storage
const storage = new Storage();
const BUCKET_NAME = 'venomultrasniper'; // Your bucket name

// Set to keep track of used keys
let usedKeys = new Set();

async function readExcel(filePath) {
  try {
    // Load the file from Google Cloud Storage
    const file = storage.bucket(BUCKET_NAME).file(filePath); // Get file from cloud storage
    const data = await file.download(); // Download file as a buffer
    const workbook = xlsx.read(data[0], { type: 'buffer' }); // Read the Excel file from the buffer
    const sheet = workbook.Sheets['Data']; // Get the 'Data' sheet
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // Convert sheet to JSON without headers

    // Remove the first row if it contains headers
    const availableKeys = jsonData.slice(1); // Adjust if necessary

    // Filter out used license keys (assuming keys are in the first column)
    const available = availableKeys.filter(row => row[0] && !usedKeys.has(row[0]));

    if (available.length > 0) {
      const extractedNumber = available[0][0]; // Get the first available license key
      usedKeys.add(extractedNumber); // Mark this key as used
      return extractedNumber;
    }

    return null; // If no available keys
  } catch (error) {
    console.error('Error reading Excel file from Google Cloud Storage:', error);
    return null;
  }
}

export default readExcel;
