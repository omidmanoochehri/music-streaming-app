const axios = require( 'axios' );
const fs = require( 'fs' );

// File paths
const artistNamesFilePath = 'artistNames.json';
const dataFilePath = 'data.json';
const notFoundLogFilePath = 'notFoundArtists.log';

const X_API_KEY = "40e87948bd4ef75efe61205ac5f468a9fd2b970511acf58c49706ecb984f1d67";
const alphabet = 'abcdefghijklmnopqrstuvwxyz';

async function searchArtistNamesByLetter ( letter )
{
    try
    {
        const response = await axios( {
            url: `https://play.radiojavan.com/api/p/search?query=${letter}`,
            method: "GET",
            headers: {
                "x-api-key": X_API_KEY
            }
        } );
        console.log( `Results for letter '${letter}':`, response.data[ "all_artists" ].length );
        return response.data[ "all_artists" ].map( artist => artist.name );
    } catch ( error )
    {
        console.error( `Error searching for letter '${letter}':`, error.message );
    }
}


// Function to read the artist names from the file
function readArtistNames ( filePath )
{
    if ( fs.existsSync( filePath ) )
    {
        const data = fs.readFileSync( filePath );
        return JSON.parse( data );
    }
    return [];
}

// Function to read the current data from the file
function readDataFile ( filePath )
{
    if ( fs.existsSync( filePath ) )
    {
        const data = fs.readFileSync( filePath );
        return JSON.parse( data );
    }
    return [];
}

// Function to write data to the file
function writeDataFile ( filePath, data )
{
    fs.writeFileSync( filePath, JSON.stringify( data, null, 2 ) );
}

// Function to check if an artist is already in the data
function isArtistInData ( data, artistName )
{
    return data.some( ( { query } ) => query === artistName );
}

// Function to fetch artist data from the API
async function fetchArtistData ( artistName )
{
    try
    {
        const response = await axios( {
            url: `https://play.radiojavan.com/api/p/artist?query=${artistName}`,
            method: "GET",
            headers: {
                "x-api-key": X_API_KEY
            }
        } );
        return response.data;
    } catch ( error )
    {
        console.error( `Error fetching data for artist ${artistName}:`, error );
        return null;
    }
}

// Function to log not found artists
function logNotFoundArtist ( filePath, artistName )
{
    fs.appendFileSync( filePath, `${artistName}\n` );
}

// Main function to process the artist list
async function processArtists ()
{
    const artistNames = readArtistNames( artistNamesFilePath );
    let data = readDataFile( dataFilePath );

    let addedCounter = 0;
    let notFoundCounter = 0;
    let alreadyExistsCounter = 0;

    for ( const artistName of artistNames )
    {
        if ( !isArtistInData( data, artistName ) )
        {
            const artistData = await fetchArtistData( artistName );
            if ( artistData && artistData.mp3s && artistData.mp3s.length )
            { //artistData.videos && artistData.videos.length
                data.push( artistData );
                console.log( `Added artist: ${artistName}` );
                writeDataFile( dataFilePath, data ); // Update the file immediately
                addedCounter++;
            } else
            {
                console.log( `Artist not found: ${artistName}` );
                logNotFoundArtist( notFoundLogFilePath, artistName ); // Log not found artist
                notFoundCounter++;
            }
        } else
        {
            console.log( `Artist already in data: ${artistName}` );
            alreadyExistsCounter++;
        }
    }

    console.log( 'Data processing complete.' );
    console.log( `Added artists: ${addedCounter}` );
    console.log( `Not found artists: ${notFoundCounter}` );
    console.log( `Already exists artists: ${alreadyExistsCounter}` );
}

async function processArtistsByLetter ()
{
    for ( const letter of alphabet )
    {
        let artistNames = await searchArtistNamesByLetter( letter );
        let data = readDataFile( dataFilePath );
        console.log( "artistNames", artistNames )
        let addedCounter = 0;
        let notFoundCounter = 0;
        let alreadyExistsCounter = 0;

        for ( const artistName of artistNames )
        {
            if ( !isArtistInData( data, artistName ) )
            {
                const artistData = await fetchArtistData( artistName );
                if ( artistData && artistData.mp3s && artistData.mp3s.length )
                { //artistData.videos && artistData.videos.length
                    data.push( artistData );
                    console.log( `Added artist: ${artistName}` );
                    writeDataFile( dataFilePath, data ); // Update the file immediately
                    addedCounter++;
                } else
                {
                    console.log( `Artist not found: ${artistName}` );
                    logNotFoundArtist( notFoundLogFilePath, artistName ); // Log not found artist
                    notFoundCounter++;
                }
            } else
            {
                console.log( `Artist already in data: ${artistName}` );
                alreadyExistsCounter++;
            }
        }

        console.log( 'Data processing complete.' );
        console.log( `Added artists: ${addedCounter}` );
        console.log( `Not found artists: ${notFoundCounter}` );
        console.log( `Already exists artists: ${alreadyExistsCounter}` );
    }
}

// Run the main function
// processArtists();
// processArtistsByLetter();