const axios = require( 'axios' );
const fs = require( 'fs' );
const path = require( 'path' );

// File path for the data file
const dataFilePath = 'data.json';
const tracksFilePath = 'tracks.json';

const X_API_KEY = "40e87948bd4ef75efe61205ac5f468a9fd2b970511acf58c49706ecb984f1d67";

async function getMp3Data ( id )
{
    try
    {
        const response = await axios( {
            url: `https://play.radiojavan.com/api/p/mp3?id=${id}`,
            method: "GET",
            headers: {
                "x-api-key": X_API_KEY
            }
        } );
        return response.data;
    } catch ( error )
    {
        console.error( `Error getting mp3 '${id}':`, error.message );
    }
}

// Function to read the current data from the file
function readJsonFile ( filePath )
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
function isTrackInData ( data, trackId )
{
    return data.some( ( { id } ) => id === trackId );
}

// Main function to process the artist data and download MP3s
async function downloadMP3s ()
{
    const data = readJsonFile( dataFilePath );
    let tracks = readJsonFile( tracksFilePath );

    for ( const artist of data )
    {
        if ( artist.mp3s && artist.mp3s.length )
        {
            for ( const mp3 of artist.mp3s )
            {
                let mp3Data = await getMp3Data( mp3.id );

                if ( mp3Data )
                {
                    if ( !isTrackInData( tracks, mp3Data.id ) )
                    {
                        try
                        {
                            delete mp3Data[ "related" ];
                            delete mp3Data[ "album_tracks" ];
                            delete mp3Data[ "selfies" ];

                        } catch ( error )
                        {
                            console.log( "error", error )
                        }
                        tracks.push( mp3Data );
                        console.log( `Added mp3 data: ${mp3.id}` );
                        writeDataFile( tracksFilePath, tracks );
                    }
                    else
                    {

                        console.log( "The Track is already exist!", mp3Data.id )
                    }
                }
            }
        }
    }

    console.log( 'MP3 downloading complete.' );
}

// Run the main function
downloadMP3s();
