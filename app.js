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
