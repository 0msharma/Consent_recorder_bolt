// Utility to clear the log Excel file in S3
// async function clearLogExcel() {
//   // Only the header row is kept
//   const rows = [['Date Time (IST)', 'Recording Name', 'Campaign Number', 'Watched Duration (seconds)']];
//   const newSheet = XLSX.utils.aoa_to_sheet(rows);
//   const newWorkbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'Log');
//   const buffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'buffer' });
//   await s3.putObject({
//     Bucket: process.env.AWS_S3_BUCKET_NAME,
//     Key: LOG_FILE_KEY,
//     Body: buffer,
//     ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//   }).promise();
//   console.log('✅ Log Excel file cleared (only header row kept)');
// }
const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const cors = require('cors');
const dotenv = require('dotenv');
const XLSX = require('xlsx');

dotenv.config();

const app = express();
const port = 4000;

app.use(cors()); // allow frontend access

const storage = multer.memoryStorage();
const upload = multer({ storage });

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const LOG_FILE_KEY = 'recordings_log.xlsx'; // or any path you want

async function appendLogToS3(recordingName, campaignNumber, watchedDuration) {

  let rows = [];
  let workbook;

  try {
    const data = await s3.getObject({ Bucket: process.env.AWS_S3_BUCKET_NAME, Key: LOG_FILE_KEY }).promise();
    workbook = XLSX.read(data.Body, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  } catch (err) {
    if (err.code === 'NoSuchKey') {
      rows = [['Date Time (IST)', 'Recording Name', 'Campaign Number', 'Watched Duration (seconds)']];
      workbook = XLSX.utils.book_new();
    } else {
      console.error('Error reading Excel file:', err);
      throw err;
    }
  }

  // Get current date/time in IST

  const now = new Date();
    const options = {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // 24-hour format
    };

    const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(now);
    // console.log(formattedDate);

  rows.push([formattedDate, recordingName, campaignNumber, watchedDuration]);

  const newSheet = XLSX.utils.aoa_to_sheet(rows);
  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'Log');

  const buffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'buffer' });

  await s3.putObject({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: LOG_FILE_KEY,
    Body: buffer,
    ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }).promise();

  console.log(`✅ Log saved for ${recordingName} | Campaign: ${campaignNumber}, Duration: ${watchedDuration}`);
}

app.post('/upload', upload.single('video'), async (req, res) => {
  const file = req.file;
  const { campaignNumber, watchedDuration } = req.body; // Expect this from frontend

  if (!file) {
    return res.status(400).send('Missing video file');
  }

  // Generate a unique recording name (or use session/campaign info)
  const recordingName = `${Date.now()}-${file.originalname}`;

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: recordingName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const result = await s3.upload(uploadParams).promise();
    await appendLogToS3(recordingName, campaignNumber || 'N/A', watchedDuration || '0'); // Default to 001 if not provided
    res.status(200).json({ url: result.Location });
  } catch (err) {
    console.error(err);
    res.status(500).send('Upload failed');
  }
});

// app.post('/clear-log', async (req, res) => {
//   try {
//     await clearLogExcel();
//     res.status(200).send('Log Excel file cleared.');
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Failed to clear log.');
//   }
// });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


