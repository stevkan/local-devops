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

const filePath = path.join(process.env.FILEPATH, process.env.FILENAME);

const createFile = async () => {
  try {
    // Check if the file exists
    await fs.access(filePath);
    console.log(`File ${process.env.FILENAME} already exists.`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // File doesn't exist, create it
      const headers = ['State', 'ID', 'Issue ID', 'Repository', 'Title', 'Changed Date', 'Created Date'];
      const data = [headers];
      const csv = Papa.unparse(data);

      try {
        await fs.writeFile(filePath, csv);
        console.log(`File ${process.env.FILENAME} created successfully.`);
      } catch (err) {
        console.error('Error creating file:', err);
      }
    } else {
      console.error('Error checking file existence:', err);
    }
  }
};

createFile();

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
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves when the response has been sent.
 */
app.get('/file', async (req, res) => {
  try {
    // Read JSON file from file
    const file = await fs.readFile(`${filePath}`, { encoding: 'utf-8' });
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
 * @param {any[]} req.body.data - The data to be converted to CSV and saved.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when the file has been saved.
 */
app.post('/save', async (req, res) => {
  const { data } = req.body;
  // TODO: Validate data before using it

  try {
    const csv = Papa.unparse(data);

    // Save CSV data to file
    await fs.writeFile(`${filePath}`, csv);
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
 * @param {Object[]} req.body.data - The data to be converted to a CSV file.
 * @returns {Promise<void>} - A Promise that resolves when the CSV file has been saved.
 */
app.post('/merge', async (req, res) => {
  const { data } = req.body;
  // TODO: Validate data before using it

  try {
    // Backup current CSV file
    const currentFile = await fs.readFile(`${filePath}`, { encoding: 'utf-8' });
    const currentData = Papa.parse(currentFile, {header: true}).data;
    // await fs.writeFile(`${filePath}`, Papa.unparse(parsedFile));
    console.info( 'Backup created');

    const incomingData = JSON.parse(data);
    let duplicatesCount = 0;
    const newData = [...incomingData];

    // Remove duplicate entries
    const parsedFile = currentData.map((row) => {
      incomingData.forEach((newRow) => {
        if (row.ID === newRow.ID) {
          duplicatesCount++;
          const rowIndex = newData.findIndex(r => r.ID === newRow.ID);
          newData.splice(rowIndex, 1);
        }
      });
      return row;
    });

    // Merge current and new data
    if (newData.length > 0) {
      // Add new rows
      newData.forEach(row => {
        parsedFile.push(row);
      });
    };

    // Convert JSON data to CSV
    const csv = Papa.unparse(JSON.stringify(parsedFile));

    // Save merged data to file
    await fs.writeFile(`${filePath}`, csv);
    if(newData.length > 0 && duplicatesCount > 0) {
      res.statusMessage = `Inserted ${newData.length} new row(s). Ignored ${duplicatesCount} row(s). Data merged and saved.`;
      res.status(201).send();
    } else if(newData.length > 0 && duplicatesCount === 0) {
      res.statusMessage = `Inserted ${newData.length} new row(s). Data merged and saved.`;
      res.status(201).send();
    } else {
      res.statusMessage = 'No new data to merge';
      res.status(204).send();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error merging data');
  }
});

/**
 * Handles a DELETE request to remove a row from the CSV file.
 *
 * @param {Object} req - The HTTP request object.
 * @param {number} req.body.rowIndex - The index of the row to be deleted.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves when the response has been sent.
 */
app.delete('/delete', async (req, res) => {
  try {
    const { rowId } = req.body;
    // Read the existing CSV file
    const csvData = await fs.readFile(`${filePath}`, { encoding: 'utf-8' });

    // Parse the CSV data into an array of objects
    const data = Papa.parse(csvData, { header: true }).data;

    // Remove the row at the specified index
    const rowIndex = data.findIndex(r => r.ID === rowId);
    data.splice(rowIndex, 1);

    // Convert the updated data back to a CSV string
    const updatedCsv = Papa.unparse(data);

    // Write the updated CSV data back to the file
    await fs.writeFile(`${filePath}`, updatedCsv);

    res.status(200).send('Row deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting row');
  }
});

const PORT = process.env.PORT || 6550;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
