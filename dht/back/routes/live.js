var express = require( 'express' );
var router = express.Router();
var md5 = require( 'md5' );
// var moment=require("moment");
var moment = require( 'moment-timezone' );
const getMP3Duration = require( 'get-mp3-duration' );
const ffmpeg = require( "fluent-ffmpeg" );
var fs = require( "fs" );
// moment().tz("Asia/Tehran").format();
// require('moment/locale/fa');
moment.tz.setDefault( 'Asia/Tehran' );
const ScheduleModel = require( '../models/Schedule' );
const PodcastModel = require( '../models/Podcast' );
const redis = require( "redis" );
const client = redis.createClient();

const nowPlaying = ( channelNumber, callback ) =>
{
    let now = moment( new Date(), "YYYY/MM/DD" );
    ScheduleModel.findOne( {
        end_datetime: {
            $gt: now
        },
        channel: channelNumber
    } ).populate( {
        path: 'podcast',
        select: '-_id name genre cover artist podcastFile',
        populate: [ {
            path: 'genre',
            select: '-_id name'
        },
        {
            path: 'artist',
            select: '-_id name'
        } ]
    } ).sort( { end_datetime: 1 } ).exec( ( err, schedule ) =>
    {
        if ( err )
        {
            console.error( `error: ${err.message}` );
            return;
        }
        schedule ? callback( err, schedule ) : PodcastModel.countDocuments().exec( ( error, podcastsCount ) =>
        {
            if ( error )
            {
                console.error( `error: ${error.message}` );
                return;
            }

            // Get a random entry
            var random = Math.floor( Math.random() * podcastsCount );
            let now = moment( new Date(), "YYYY/MM/DD HH:mm:ss" );

            PodcastModel.findOne().skip( random ).exec(
                ( err, podcast ) =>
                {
                    if ( err )
                    {
                        return console.log( err )
                    }
                    else
                    {
                        return callback( err, {
                            podcast,
                            start_datetime: now.format( "YYYY/MM/DD HH:mm:ss" ),
                            end_datetime: now.add( 1, "hours" ).format( "YYYY/MM/DD HH:mm:ss" ),
                            channel: channelNumber
                        } )
                    }
                }
            )
        } )
    } )
}

// router.get('/livetest/', function (req, res) {
//     var path = "https://dls.music-fa.com/tagdl/downloads/Mohsen%20Chavoshi%20-%20Ghande%20Mani%20(320).mp3";
//     res.set({ "Content-Type": "audio/mpeg" });
//     ffmpeg()
//         .input(path)
//         .toFormat("mp3")
//         .pipe(res);
// });

router.get('/stream/', function(req, res) {


    var music = __dirname + "\\Chavoshi.mp3";//'music/' + key + '.mp3';
   console.log("test",music)
    var stat = fs.statSync(music);
 
    range = req.headers.range;
    var readStream;

    if (range !== undefined) {
        var parts = range.replace(/bytes=/, "").split("-");

        var partial_start = parts[0];
        var partial_end = parts[1];

        if ((isNaN(partial_start) && partial_start.length > 1) || (isNaN(partial_end) && partial_end.length > 1)) {
            return res.sendStatus(500); //ERR_INCOMPLETE_CHUNKED_ENCODING
        }

        var start = parseInt(partial_start, 10);
        var end = partial_end ? parseInt(partial_end, 10) : stat.size - 1;
        var content_length = (end - start) + 1;

        res.status(206).header({
            'Content-Type': 'audio/mpeg',
            'Content-Length': content_length,
            'Content-Range': "bytes " + start + "-" + end + "/" + stat.size,
            'Transfer-Encoding': 'chunked'
        });

        readStream = fs.createReadStream(music, {start: start, end: end});
    } else {
        res.header({
            'Content-Type': 'audio/mpeg',
            'Content-Length': stat.size,
            'Transfer-Encoding': 'chunked'
        });
        readStream = fs.createReadStream(music);
    }
    readStream.pipe(res);
});

router.post( '/channel/:channelNumber', async function ( req, res, next )
{
    const { channelNumber } = req.params;
    client.get( `ch_${channelNumber}`, function ( err, playingSchedule )
    {
        let now = JSON.parse( playingSchedule );
        if ( now ) now.end_datetime = now.end_datetime.split( "T" ).join( " " ).split( "Z" ).join( "" );
        if ( now && moment( now.end_datetime ).isBefore( moment() ) )
        {
            client.del( `ch_${channelNumber}`, function ( err, response )
            {
                if ( response == 1 )
                {
                    console.log( `Deleted ch_${channelNumber} Successfully!` );
                    res.json( {} );
                } else
                {
                    console.log( `Cannot delete ch_${channelNumber}` );
                }
            } );
        }
        else
        {
            res.json( now );
        }




    } );

} );

router.post( '/chanasdnel/:channelNumber', function ( req, res, next )
{
    const { channelNumber } = req.params;
    // ${name ? name : 'Tehran Night #272 Shemroon.mp3'}


    nowPlaying( channelNumber, function ( err, schedule )
    {
        if ( err )
        {
            res.json( {
                result: "Sorry, An unknown error has occured!"
            } )
        } else
        {
            console.log( "schedule", schedule, schedule.end_datetime )

            let expireDateTimeStamp = +new Date( moment( schedule.end_datetime ).add( 10, "minutes" ) )
            console.log( "expireDateTimeStamp", expireDateTimeStamp );
            let KEY = "DEEPHOUSETEHRAN" + schedule.podcast.name + moment().format();
            let path = "/live/CHANNEL" + channelNumber;
            let TOKEN = expireDateTimeStamp + "-" + md5( `${path}-${expireDateTimeStamp}-${KEY}` );


            var now = moment( new Date(), "YYYY/MM/DD HH:mm:ss" );
            // var startDateTime = moment(new Date()).format("YYYY/MM/DD") + " " + "22:00:00";
            var startDateTime = moment.utc( schedule.start_datetime ).format( "YYYY/MM/DD HH:mm:ss" );

            var diff = moment(
                now.diff(
                    startDateTime
                )
            ).add( -210, "minutes" ).format( "HH:mm:ss" )

            console.log( "diff", diff, now.format( "YYYY/MM/DD HH:mm:ss" ), startDateTime )
            // const command = `ffmpeg -ss ${diff} -re -i "${__dirname}/../media/podcasts/${schedule.podcast.podcastFile}" -c:v libx264 -preset veryfast -tune zerolatency -c:a aac -strict -2 -ar 44100 -f flv rtmp://localhost/live/${schedule.podcast.name.replace("#", '').replace(/\s/g, "-")}-${TOKEN}`; //${channelNumber}`;
            // const command = `ffmpeg -ss ${diff} -f mp3 -i "${__dirname}/../media/podcasts/${schedule.podcast.name}.mp3" -acodec libmp3lame -ab 128k -ac 2 -ar 44100 -f flv rtmp://localhost:8000/live/CHANNEL${channelNumber}`;
            // //  shell.exec('')
            const command = `ffmpeg -f mp3  -i "${__dirname}/../media/podcasts/${schedule.podcast.podcastFile}" -acodec libmp3lame -ab 128k -ac 2 -ar 44100 -re -f flv rtmp://localhost:8000/live/1`;
            console.log( command )
            const { exec } = require( 'child_process' );

            exec( command, ( error, stdout, stderr ) =>
            {
                if ( error )
                {
                    console.error( `error: ${error.message}` );
                    return;
                }

                if ( stderr )
                {
                    console.error( `stderr: ${"stderr"}`, expireDateTimeStamp );
                    return;
                }

                console.log( `stdout:\n${stdout}` );
            } );



            const buffer = fs.readFileSync( `${__dirname}/../media/podcasts/${schedule.podcast.podcastFile}` )
            var duration = getMP3Duration( buffer )
            duration = moment.duration( duration, 'milliseconds' );
            let hours = Math.floor( duration.asHours() );
            let mins = Math.floor( duration.asMinutes() ) - hours * 60;
            let seconds = Math.floor( duration.asSeconds() ) - ( hours * 60 * 60 ) - ( mins * 60 );
            duration = ( hours < 10 ? "0" + hours : hours ) + ":" + ( mins < 10 ? "0" + mins : mins ) + ":" + ( seconds < 10 ? "0" + seconds : seconds );
            const podcast = {
                name: schedule.podcast.name,
                cover: schedule.podcast.cover,
                duration: duration,
                artist: schedule.podcast.artist
            }

            res.send( {
                TOKEN,
                podcast
            } );

        }
    } )


} );

module.exports = router;