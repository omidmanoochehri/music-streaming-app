const axios = require('axios');
const fs = require('fs');

const dataFilePath = 'data.json';

// Function to read the current data from the file
function readDataFile(filePath) {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath);
        return JSON.parse(data);
    }
    return [];
}

let data = readDataFile(dataFilePath);

console.log("data",data.length)

function removeDuplicates(array) {
    // Using a Set to keep track of unique stringified objects
    const seen = new Set();
    
    return array.filter(item => {
      // Stringify the object to use it as a unique identifier
      const stringifiedItem = JSON.stringify(item);
      
      // Check if the item has been seen before
      if (seen.has(stringifiedItem)) {
        console.log("item",item.artist)
        return false; // It's a duplicate, so filter it out
      } else {
        seen.add(stringifiedItem); // Add the new item to the set
        return true; // Keep the item in the array
      }
    });
  }

let counter=0;

data.forEach(artist => {
    counter +=artist.mp3s  ? artist.mp3s.length : 0;
});

console.log("mp3s",counter);

const uniqueArray = removeDuplicates(data);
console.log("uniqueArray",uniqueArray.length);

 counter=0;
uniqueArray.forEach(artist => {
    counter +=artist.mp3s  ? artist.mp3s.length : 0;
});

console.log("mp3s",counter);

fs.writeFileSync( dataFilePath, JSON.stringify( uniqueArray, null, 2 ) );