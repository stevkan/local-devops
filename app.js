// server.js

const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs').promises; // Use promises version of fs
const Papa = require('papaparse');
const cors = require('cors');
const bodyParser = require('body-parser');

const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

app.use(
  cors({
    origin: ['http://localhost:6550', 'https://webchats.ngrok.io', 'http://127.0.0.1:5500'],
    credentials: true,
  }) 
);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(
  bodyParser.json({
    extended: false,
  })
);

/**
 * Handles a POST request to the '/file' endpoint, which reads a JSON file from the file system and sends the contents back to the client.
 *
 * @param {Object} req - The HTTP request object.
 * @param {string} req.body.filePath - The path to the JSON file to be read.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves when the response has been sent.
 */
app.post('/file', async (req, res) => {
  try {
    const { filePath } = req.body;
    // Read JSON file from file
    const file = await fs.readFile(`${process.env.FILEPATH}${filePath}`, { encoding: 'utf-8' });
    if (file.length > 2) {
      res.status(200).send(JSON.stringify(file));
    }
    if (file.length === 2) {
      res.status(204).send('File meta data is empty');
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(404).send(`File not found: ${err}`);
    } else {
      res.status(err.statusCode).send(err);
    }
  }
});

/**
 * Saves CSV data to a file on the server.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing the file path and data to save.
 * @param {string} req.body.filePath - The path to the file to save the CSV data to.
 * @param {any[]} req.body.data - The data to be converted to CSV and saved.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when the file has been saved.
 */
app.post('/save', async (req, res) => {
  const { filePath, data } = req.body;
  // TODO: Validate data before using it

  try {
    // Convert JSON data to CSV
    const csv = Papa.unparse(data);

    // Save CSV data to file
    await fs.writeFile(`${process.env.FILEPATH}${filePath}`, csv);
    res.status(201).send('Data saved');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving data');
  }
});

/**
 * Handles a POST request to the '/merge' endpoint. This endpoint expects a request body with a 'fileName' and 'data' property. The 'data' property
 * should be an array of objects that will be converted to a CSV file and saved to the file system. The current CSV file is backed up before the new data is saved.
 *
 * @param {Object} req - The Express request object.
 * @param {string} req.body.fileName - The name of the CSV file to be saved.
 * @param {Object[]} req.body.data - The data to be converted to a CSV file.
 * @returns {Promise<void>} - A Promise that resolves when the CSV file has been saved.
 */
app.post('/merge', async (req, res) => {
  const { fileName, data } = req.body;
  // TODO: Validate data before using it

  try {
    // Convert JSON data to CSV
    const csv = Papa.unparse(data);

    // Backup current CSV file
    const currentFile = await fs.readFile(`${process.env.FILEPATH}${fileName}.csv`, { encoding: 'utf-8' });
    const parsedFile = Papa.parse(currentFile, {header: true}).data;
    await fs.writeFile(`${process.env.FILEPATH}${fileName}.bak`, Papa.unparse(parsedFile));
    console.log( 'Backup created')

    // Save CSV data to file and return online link
    await fs.writeFile(`${process.env.FILEPATH}${fileName}.csv`, csv);
    res.status(201).send('Data saved');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving data');
  }
});

const PORT = process.env.PORT || 6550;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
