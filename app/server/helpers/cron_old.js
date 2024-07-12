var express = require("express");
var router = express.Router();
const ScheduleModel = require("../models/Schedule");
const PodcastModel = require("../models/Podcast");
var md5 = require("md5");
var moment = require("moment-timezone");
// const getMP3Duration = require( 'get-mp3-duration' );
const ffmpeg = require("fluent-ffmpeg");
var fs = require("fs");
const redis = require("redis");
const redis_client = redis.createClient();
moment.tz.setDefault("Asia/Tehran");
var CronJob = require("cron").CronJob;
var flag = { ch1: false, ch2: false };
const { getVideoDurationInSeconds } = require("get-video-duration");
var glob = require("glob");

var hls_temp_files = `${
  process.platform == "linux" ? "/var/www/html/" : `../front/public/`
}stream/*`;
console.log(hls_temp_files);
glob(hls_temp_files, function (er, files) {
  for (const file of files) {
    // console.log(file)
    fs.unlinkSync(file);
  }
});

redis_client.del(`ch_1`, function (err, response) {
  if (response == 1) {
    console.log(`Deleted ch_1 Successfully!`);
  } else {
    console.log(`Cannot delete ch_1`, err);
  }
});

redis_client.del(`ch_2`, function (err, response) {
  if (response == 1) {
    console.log(`Deleted ch_2 Successfully!`);
  } else {
    console.log(`Cannot delete ch_2`, err);
  }
});

var current_datetime = moment().add(3.5, "hours");
const allowPlayRandom = true;
var job = new CronJob(
  "*/60 * * * * *",
  function () {
    console.log("The cronjob is running...");
    current_datetime = moment().add(3.5, "hours");
    handleLive(1);
    handleLive(2);
    console.log("End of cron");
  },
  null,
  true,
  "Asia/Tehran"
);
job.start();

const calculateDiffTime = (now, start_datetime) => {
  let diff = moment.duration(
    moment.utc(now).diff(moment.utc(start_datetime)),
    "milliseconds"
  );

  let hours = Math.floor(diff.asHours());
  let mins = Math.floor(diff.asMinutes()) - hours * 60;
  let seconds = Math.floor(diff.asSeconds()) - hours * 60 * 60 - mins * 60;
  diff =
    (hours < 10 ? "0" + hours : hours) +
    ":" +
    (mins < 10 ? "0" + mins : mins) +
    ":" +
    (seconds < 10 ? "0" + seconds : seconds);
  return diff;
};

const handleLive = (channelNumber) => {
  ScheduleModel.findOne({
    start_datetime: {
      $lt: current_datetime, //,
      // $gt: moment().add( 1, "minute" ).format( "YYYY-MM-DD HH:mm" )
    },
    end_datetime: {
      $gt: current_datetime,
    },
    channel: channelNumber,
  })
    .populate({
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
    })
    .sort({ end_datetime: 1 })
    .exec((err, schedule) => {
      console.log("schedule", schedule);
      if (err) {
        console.error(`error: ${err.message}`);
        return;
      }
      schedule
        ? playPodcast(err, schedule)
        : allowPlayRandom &&
          PodcastModel.countDocuments().exec((error, podcastsCount) => {
            if (error) {
              console.error(`error: ${error.message}`);
              return;
            } else {
              // Get a random entry
              var random = Math.floor(Math.random() * podcastsCount);
              redis_client.get(
                `ch_${channelNumber == 1 ? 2 : 1}`,
                function (err, channelSchedule) {
                  let anotherChannelPodcast = channelSchedule
                    ? JSON.parse(channelSchedule).podcast._id
                    : "";
                  console.log(anotherChannelPodcast);
                  PodcastModel.findOne(
                    anotherChannelPodcast
                      ? { _id: { $ne: anotherChannelPodcast } }
                      : {}
                  )
                    .skip(random)
                    .exec((er, podcast) => {
                      if (er) {
                        return console.log(er);
                      } else {
                        if (podcast) {
                          let duration = moment.duration(
                            podcast.duration,
                            "milliseconds"
                          );
                          return playPodcast(er, {
                            podcast,
                            start_datetime: current_datetime,
                            end_datetime: moment(current_datetime)
                              .add(duration, "milliseconds")
                              .format("YYYY-MM-DD HH:mm:ss"),
                            channel: channelNumber,
                          });
                        }
                      }
                    });
                }
              );
            }
          });
    });
};

const playPodcast = (err, schedule) => {
  let channelNumber = schedule.channel;
  console.log("flag", flag["ch" + channelNumber]);

  if (flag["ch" + channelNumber]) return false;
  flag["ch" + channelNumber] = true;
  console.log("flag " + channelNumber + " on");

  // var duration = moment.duration( schedule.podcast.duration ).as( "milliseconds" );
  // const buffer = fs.readFileSync( `${__dirname}/../media/podcasts/${schedule.podcast.podcastFile}` )
  // var duration = getMP3Duration( buffer )

  getVideoDurationInSeconds(
    `${__dirname}/../media/podcasts/${schedule.podcast.podcastFile}`
  ).then((duration) => {
    duration = Math.floor(duration);
    redis_client
      .multi() // starting a transaction
      .set([
        `ch_${channelNumber}`,
        JSON.stringify(schedule),
        "EX",
        duration,
      ]) /*NX:  Only set the key if it does not already exist*/
      .exec(redis.print);
    if (err) {
      console.log({
        result: err,
      });
    } else {
      let expireDateTimeStamp = +new Date(
        moment(schedule.end_datetime).add(10, "minutes")
      );
      let KEY = "DEEPHOUSETEHRAN" + schedule.podcast.name + moment().format();
      let path = "/live/CHANNEL" + schedule.channel;
      let TOKEN =
        expireDateTimeStamp +
        "-" +
        md5(`${path}-${expireDateTimeStamp}-${KEY}`);
      let diff_time = calculateDiffTime(
        current_datetime,
        schedule.start_datetime
      );

      const command1 = `ffmpeg -i "${__dirname}/../media/podcasts/${schedule.podcast.podcastFile}" -vn -ac 2 -acodec aac -f segment -segment_format mpegts -segment_time 10 -segment_list channel${schedule.channel}.m3u8 audio_ch${schedule.channel}_segment%05d.ts`;

      //  const command2 = `ffmpeg -ss 00:00:00 -re -i channel${schedule.channel}.m3u8 -c:v libx264 -preset veryfast -tune zerolatency -c:a aac -strict -2 -ar 44100 -f flv rtmp://localhost/live/${schedule.podcast.name.replace("#", '').replace(/\s/g, "-")}-${TOKEN}`;
      const command2_alt = `ffmpeg -ss ${diff_time} -re -i "${__dirname}/../media/podcasts/${schedule.podcast.podcastFile}" -c:v libx264 -preset veryfast -tune zerolatency -c:a aac -strict -2 -ar 44100 -f flv rtmp://localhost/live/ch${schedule.channel}`;

      //const command3_test=`ffmpeg -ss 00:00:00 -re -i "${__dirname}/../media/podcasts/${schedule.podcast.podcastFile}" -c:v libx264 -preset veryfast -tune zerolatency -c:a aac -strict -2 -ar 44100 -f flv tcp://localhost:8000/live/ch${schedule.channel}`

      const command4 = `ffmpeg -re -i "${__dirname}/../media/podcasts/${
        schedule.podcast.podcastFile
      }" -vcodec libx264 -profile:v main -g 25 -r 25 -b:v 500k -keyint_min 250 -strict experimental -pix_fmt yuv420p -movflags empty_moov+default_base_moof -preset ultrafast -f mp4 tcp://localhost:${
        channelNumber == 1 ? "9090" : "9091"
      }`;
      const dash_command = `ffmpeg -y -re -i "${__dirname}/../media/podcasts/${schedule.podcast.podcastFile}" -map 0  -use_timeline 1 -use_template 1 -window_size 5 -adaptation_sets "id=0,streams=v id=1,streams=a" -strict -2 -f dash /var/www/html/dash/channel${schedule.channel}.mpd`;
      const hls_command = `ffmpeg -ss ${diff_time} -re -i "${__dirname}/../media/podcasts/${
        schedule.podcast.podcastFile
      }" -filter_complex  "[0:v]split=3[v1][v2][v3];  [v1]copy[v1out]; [v2]scale=w=1280:h=720[v2out]; [v3]scale=w=640:h=360[v3out]" -map [v1out] -c:v:0 libx264 -x264-params "nal-hrd=cbr:force-cfr=1" -b:v:0 5M -maxrate:v:0 5M -minrate:v:0 5M -bufsize:v:0 10M -preset slow -g 48 -sc_threshold 0 -keyint_min 48 -map [v2out] -c:v:1 libx264 -x264-params "nal-hrd=cbr:force-cfr=1" -b:v:1 3M -maxrate:v:1 3M -minrate:v:1 3M -bufsize:v:1 3M -preset slow -g 48 -sc_threshold 0 -keyint_min 48 -map [v3out] -c:v:2 libx264 -x264-params "nal-hrd=cbr:force-cfr=1" -b:v:2 1M -maxrate:v:2 1M -minrate:v:2 1M -bufsize:v:2 1M -preset slow -g 48 -sc_threshold 0 -keyint_min 48 -map a:0 -c:a:0 aac -b:a:0 96k -ac 2 -map a:0 -c:a:1 aac -b:a:1 96k -ac 2 -map a:0 -c:a:2 aac -b:a:2 48k -ac 2 -f hls -hls_time 2 -hls_list_size 50 -hls_flags independent_segments -hls_segment_type mpegts -hls_segment_filename stream_%v/data%02d.ts -master_pl_name master.m3u8  -var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2" ${
        process.platform == "linux" ? "/var/www/html/" : "C:/"
      }stream/hls/live${channelNumber}_%v.m3u8`;
      const hls_command2 = `ffmpeg -ss 00:00:00 -re -i "${__dirname}/../media/podcasts/${
        schedule.podcast.podcastFile
      }" -map 0:a -c:v libx264 -crf 21 -preset veryfast  -c:a aac -b:a 128k -ac 2  -f hls -hls_time 4 -hls_allow_cache 0 -hls_playlist_type event ${
        process.platform == "linux"
          ? '"/var/www/html/'
          : `"${__dirname}/../../front/public/`
      }stream/ch${channelNumber}/hls/live${channelNumber}.m3u8"`;

      const dash_command2 = `ffmpeg -ss 00:00:00 -re -i "${__dirname}/../media/podcasts/${
        schedule.podcast.podcastFile
      }" -map 0:a -c:v libx264 -crf 21 -preset veryfast  -c:a aac -b:a 128k -ac 2 -init_seg_name init\$RepresentationID\$.\$ext\$ -media_seg_name chunk\$RepresentationID\$-\$Number%05d\$.\$ext\$     -use_template 1 -use_timeline 1      -seg_duration 4 -adaptation_sets "id=0,streams=v id=1,streams=a"     -f dash ${
        process.platform == "linux" ? "/var/www/html/" : `"${__dirname}/../../front/public/`
      }stream/ch${channelNumber}/dash/live${channelNumber}.mpd`;

      console.log(hls_command2 + " && " + dash_command2);

      console.log(
        "timeout",
        moment
          .duration(calculateDiffTime(schedule.end_datetime, current_datetime))
          .asMilliseconds()
      );

      setTimeout(function () {
        flag["ch" + channelNumber] = false;
        console.log(channelNumber + "flag off");
        redis_client.del(`ch_${channelNumber}`, function (err, response) {
          hls_temp_files = `${
            process.platform == "linux" ? "/var/www/html/" : `../front/public/`
          }stream/ch${channelNumber}/hls/*`;
          glob(hls_temp_files, function (er, files) {
            for (const file of files) {
              // console.log(file)
              fs.unlinkSync(file);
            }
          });
          if (response == 1) {
            console.log(`Deleted ch_${channelNumber} Successfully!`);
          } else {
            console.log(`Cannot delete ch_${channelNumber}`);
          }
        });
      }, moment
        .duration(calculateDiffTime(schedule.end_datetime, current_datetime))
        .asMilliseconds());

      const { exec } = require("child_process");
      exec( hls_command2, (error, stdout, stderr) => {
        console.log(error, stdout, stderr);
        if (error) {
          console.error(`error: ${error.message}`);
          return;
        }

        if (stderr) {
          console.error(`stderr: ${"stderr"}`, expireDateTimeStamp);
          return;
        }

        console.log(`stdout:\n${stdout}`);
      });

      // exec( dash_command2, (error, stdout, stderr) => {
      //   console.log(error, stdout, stderr);
      //   if (error) {
      //     console.error(`error: ${error.message}`);
      //     return;
      //   }

      //   if (stderr) {
      //     console.error(`stderr: ${"stderr"}`, expireDateTimeStamp);
      //     return;
      //   }

      //   console.log(`stdout:\n${stdout}`);
      // });

    }
  });
};

handleLive(1);
handleLive(2);
