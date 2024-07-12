const axios = require('axios');
const fs = require('fs');
const path = require('path');

// File path for the data file
const dataFilePath = 'data.json';

// Directory to save the MP3 files
const mp3Directory = 'mp3s';

// Ensure the mp3 directory exists
if (!fs.existsSync(mp3Directory)) {
    fs.mkdirSync(mp3Directory);
}

// Function to read the current data from the file
function readDataFile(filePath) {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath);
        return JSON.parse(data);
    }
    return [];
}

// Function to download MP3 file
async function downloadMP3(url, filePath) {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
        });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Error downloading ${url}:`, error);
    }
}

// Main function to process the artist data and download MP3s
async function downloadMP3s() {
    const data = readDataFile(dataFilePath);

    for (const artist of data) {
        if (artist.mp3s && artist.mp3s.length) {
            for (const mp3 of artist.mp3s) {
                const mp3Url = mp3.link;
                const mp3FileName = path.basename(mp3Url);
                const mp3FilePath = path.join(mp3Directory, mp3FileName);
                
                if (!fs.existsSync(mp3FilePath)) {
                    console.log(`Downloading ${mp3FileName}...`);
                    await downloadMP3(mp3Url, mp3FilePath);
                    console.log(`Downloaded ${mp3FileName}`);
                } else {
                    console.log(`${mp3FileName} already exists.`);
                }
            }
        }
    }
    
    console.log('MP3 downloading complete.');
}

// Run the main function
downloadMP3s();
