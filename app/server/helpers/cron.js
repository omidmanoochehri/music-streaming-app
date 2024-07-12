var express = require( "express" );
var router = express.Router();
const ScheduleModel = require( "../models/Schedule" );
const PodcastModel = require( "../models/Podcast" );
var md5 = require( "md5" );
var moment = require( "moment-timezone" );
// const getMP3Duration = require( 'get-mp3-duration' );
const ffmpeg = require( "fluent-ffmpeg" );
var fs = require( "fs" );
const redis = require( "redis" );
const redis_client = redis.createClient();
moment.tz.setDefault( "Asia/Tehran" );
var CronJob = require( "cron" ).CronJob;
var flag = { ch1: false, ch2: false };
const { getVideoDurationInSeconds } = require( "get-video-duration" );
var glob = require( "glob" );

const calculateDiffTime = ( now, start_datetime ) =>
{
  let diff = moment.duration(
    moment.utc( now ).diff( moment.utc( start_datetime ) ),
    "milliseconds"
  );

  let hours = Math.floor( diff.asHours() );
  let mins = Math.floor( diff.asMinutes() ) - hours * 60;
  let seconds = Math.floor( diff.asSeconds() ) - hours * 60 * 60 - mins * 60;
  diff =
    ( hours < 10 ? "0" + hours : hours ) +
    ":" +
    ( mins < 10 ? "0" + mins : mins ) +
    ":" +
    ( seconds < 10 ? "0" + seconds : seconds );
  return diff;
};

const getCurrentDateTime = () => moment().add( 3.5, "hours" ).format( "YYYY-MM-DD HH:mm:ss" );

redis_client.del( `ch_1`, function ( err, response )
{
  if ( response == 1 )
  {
    console.log( `Deleted ch_1 Successfully!` );
  } else
  {
    console.log( `Cannot delete ch_1`, err );
  }
} );

redis_client.del( `ch_2`, function ( err, response )
{
  if ( response == 1 )
  {
    console.log( `Deleted ch_2 Successfully!` );
  } else
  {
    console.log( `Cannot delete ch_2`, err );
  }
} );


var current_datetime = getCurrentDateTime();

var job = new CronJob(
  "*/60 * * * * *",
  function ()
  {
    console.log( "The cronjob is running..." );

    handleLive( 1 );
    handleLive( 2 );

    console.log( "End of cron" );
  },
  null,
  true,
  "Asia/Tehran"
);
job.start();





const handleLive = channelNumber =>
{
  current_datetime = getCurrentDateTime();
  console.log( "current time", current_datetime )

  console.log( "flags:", flag )

  redis_client.get( `ch_1`, function ( err, playingSchedule )
  {
    console.log( "redis ch1:", err, !!playingSchedule )
  } )

  redis_client.get( `ch_2`, function ( err, playingSchedule )
  {
    console.log( "redis ch2:", err, !!playingSchedule )
  } )

  ScheduleModel.findOne( {
    start_datetime: {
      $lte: current_datetime,
    },
    end_datetime: {
      $gt: current_datetime,
    },
    channel: channelNumber,
  } )
    .populate( {
      path: "podcast",
      select: "-_id name genre cover artist podcastFile",
      populate: [
        {
          path: "genre",
          select: "-_id name",
        },
        {
          path: "artist",
          select: "-_id name",
        },
      ],
    } )
    .sort( { end_datetime: 1 } )
    .exec( ( err, schedule ) =>
    {
      if ( err )
      {
        console.error( `error: ${err.message}` );
        return;
      } else
      {
        console.log( "schedule", schedule )
        schedule
          ? playPodcast( err, schedule )
          : ""
      }
    } )
}



const playPodcast = ( err, schedule ) =>
{
  let channelNumber = schedule.channel;
  console.log( "flag", flag[ "ch" + channelNumber ] );

  if ( flag[ "ch" + channelNumber ] ) return false;
  flag[ "ch" + channelNumber ] = true;
  console.log( "flag " + channelNumber, flag[ "ch" + channelNumber ] );


  getVideoDurationInSeconds(
    `${__dirname}/../media/podcasts/${schedule.podcast.podcastFile}`
  ).then( ( duration ) =>
  {
    duration = Math.floor( duration );
    redis_client
      .multi() // starting a transaction
      .set( [
        `ch_${channelNumber}`,
        JSON.stringify( schedule ),
        "EX",
        duration,
      ] ) /*NX:  Only set the key if it does not already exist*/
      .exec( redis.print );
    if ( err )
    {
      console.log( {
        result: err,
      } );
    } else
    {


      let startDiffTime = calculateDiffTime( current_datetime, moment( schedule.start_datetime ).format( "YYYY-MM-DD HH:mm:ss" ) )

      console.log( "startDiffTime", startDiffTime )

      const hls_command2 = `ffmpeg -ss ${startDiffTime} -re -i "${__dirname}/../media/podcasts/${schedule.podcast.podcastFile
        }" -map 0:a -c:v libx264 -crf 21 -preset veryfast  -c:a aac -b:a 128k -ac 2  -f hls -hls_time 4 -hls_allow_cache 0 -hls_playlist_type event ${process.platform == "linux"
          ? '"/var/www/html/'
          : `"${__dirname}/../../front/public/`
        }stream/ch${channelNumber}/hls/live${channelNumber}.m3u8"`;


      let timeout = moment
        .duration( calculateDiffTime( moment( schedule.end_datetime ).format( "YYYY-MM-DD HH:mm:ss" ), current_datetime ) )
        .asMilliseconds();



      console.log( "timeout", timeout );

      setTimeout( function ()
      {
        flag[ "ch" + channelNumber ] = false;
        console.log( `flag ${channelNumber} off`, flag[ "ch" + channelNumber ] );

        redis_client.del( `ch_${channelNumber}`, function ( err, response )
        {
          if ( response == 1 )
          {
            console.log( `Deleted ch_${channelNumber} Successfully!` );
          } else
          {
            console.log( `Cannot delete ch_${channelNumber}` );
          }
        } );
      }, timeout );

      const { exec } = require( "child_process" );
      exec( hls_command2, ( error, stdout, stderr ) =>
      {
        console.log( error, stdout, stderr );
        if ( error )
        {
          console.error( `error: ${error.message}` );
          return;
        }

        if ( stderr )
        {
          console.error( `stderr: ${"stderr"}` );
          return;
        }

        console.log( `stdout:\n${stdout}` );
      } );

    }
  } );
};




handleLive( 1 )
handleLive( 2 )