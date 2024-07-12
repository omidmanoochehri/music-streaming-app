const { error } = require("console");
var express = require("express");
var router = express.Router();
var formidable = require("formidable");
var fs = require("fs");
var moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tehran");
const getMP3Duration = require("get-mp3-duration");
const CategoryModel = require("../models/Category");
const PodcastModel = require("../models/Podcast");
const { getVideoDurationInSeconds } = require("get-video-duration");

const streamMusic = (music, req, res) => {
  var stat = fs.statSync(music);

  let range = req.headers.range;
  var readStream;

  if (range !== undefined) {
    var parts = range.replace(/bytes=/, "").split("-");

    var partial_start = parts[0];
    var partial_end = parts[1];

    if (
      (isNaN(partial_start) && partial_start.length > 1) ||
      (isNaN(partial_end) && partial_end.length > 1)
    ) {
      return res.sendStatus(500); //ERR_INCOMPLETE_CHUNKED_ENCODING
    }

    var start = parseInt(partial_start, 10);
    var end = partial_end ? parseInt(partial_end, 10) : stat.size - 1;
    var content_length = end - start + 1;

    res.status(206).header({
      "Content-Type": "audio/mpeg",
      "Content-Length": content_length,
      "Content-Range": "bytes " + start + "-" + end + "/" + stat.size,
      "Transfer-Encoding": "chunked",
    });

    readStream = fs.createReadStream(music, { start: start, end: end });
  } else {
    res.header({
      "Content-Type": "audio/mpeg",
      // "Content-Length": stat.size,
      "Connection": "Keep-Alive",
      "Transfer-Encoding": "chunked",
    });
    readStream = fs.createReadStream(music);
  }
  readStream.pipe(res);
};

router.get("/search/:query", function (req, res, next) {
  let { query } = req.params;
  PodcastModel.find({ name: new RegExp(query, "i") })
    .populate({
      path: "genre",
      select: "-_id name",
    })
    .populate({
      path: "artist",
      select: "-_id name",
    })
    .exec((err, podcasts) => {
      if (err) {
        res.json({
          result: "Sorry, An unknown error has occured!",
        });
      } else {
        res.json(podcasts);
      }
    });
});

/* GET a podcast. */
router.get("/:podcast_name", function (req, res, next) {
  let { podcast_name } = req.params;
  // podcast_name = Buffer.from(podcast_name, 'base64').toString('ascii');

  PodcastModel.findOne({ name: podcast_name })
    .populate({
      path: "genre",
      select: "name",
    })
    .populate({
      path: "artist",
      select: "name",
    })
    .exec(function (err, podcast) {
      err
        ? res.json({
            result: "Sorry, An unknown error has occured!",
          })
        : res.json(podcast || {});
    });
});

/* GET PodcastsList listing. */
router.get("/", function (req, res, next) {
  PodcastModel.find({})
    .populate({
      path: "genre",
      select: "name",
    })
    .populate({
      path: "artist",
      select: "name",
    })
    .exec(function (err, podcasts) {
      err
        ? res.json({
            result: "Sorry, An unknown error has occured!",
          })
        : res.json(podcasts);
    });
});

router.get(`/play/:podcast_name`, function (req, res, next) {
  let { podcast_name } = req.params;
  let referer = req.headers.referrer || req.headers.referer;
  podcast_name = Buffer.from(podcast_name, "base64").toString("ascii");
  // let {token} =req.query;
// if(token === moment().format("yyyymm")){

  PodcastModel.findOne({ podcastFile: new RegExp(podcast_name, "i") }).exec(
    (err, podcast) => {
      if (err) {
        res.json({
          result: "Sorry, An unknown error has occured!",
        });
      } else {
        console.log(podcast_name);
        if (podcast) {
          // const podcastURL = '/play/' + podcast.name.replace( "#", '' ).replace( /\s/g, "-" ) + '.flv';
          // const command = `ffmpeg -re -i "${__dirname}/../media/podcasts/${podcast.podcastFile}" -c:v libx264 -preset veryfast -tune zerolatency -c:a aac -strict -2 -ar 44100 -f flv rtmp://localhost/play/${podcast.name.replace( "#", '' ).replace( /\s/g, "-" )}`;
          // // const dash_command = `ffmpeg -y -re -i "${__dirname}/../media/podcasts/${schedule.podcast.podcastFile}" -map 0  -use_timeline 1 -use_template 1 -window_size 5 -adaptation_sets "id=0,streams=v id=1,streams=a" -strict -2 -f dash /var/www/html/dash/channel${schedule.channel}.mpd`
          // const { exec } = require( 'child_process' );
          // exec( command, ( error, stdout, stderr ) =>
          // {
          //   if ( error )
          //   {
          //     console.error( `error: ${error.message}` );
          //     return;
          //   }

          //   if ( stderr )
          //   {
          //     console.error( `stderr: ${stderr}` );
          //     return;
          //   }

          //   console.log( `stdout:\n${stdout}` );
          // } );
          // res.send( podcastURL );
          let music = `${__dirname}/../media/podcasts/${podcast.podcastFile}`;
          if (
            referer &&
            (referer.indexOf("https://app.deephousetehran.net") > -1 ||
              referer.indexOf("http://localhost:5000") > -1)
          ) {
            streamMusic(music, req, res);
          } else {
            res.json({
              result: false,
              response: "Access Denied!",
            });
          }
        } else {
          res.json({ result: false });
        }
      }
    }
  );
// }
// else
// {
//   res.json({result:false})
// }
});

router.get("/category/:category_name", function (req, res, next) {
  let { category_name } = req.params;
  CategoryModel.find({ name: category_name }, "_id").exec(
    (catDataErr, catData) => {
      if (catDataErr) {
        res.json({
          result: "Sorry, An unknown error has occured!",
        });
      } else {
        console.log("catData", catData, category_name);
        if (catData[0]) {
          let cat_id = catData[0]._id;
          PodcastModel.find({ genre: cat_id.toString() })
            .populate({
              path: "genre",
              select: "-_id name",
            })
            .populate({
              path: "artist",
              select: "-_id name",
            })
            .exec(function (err, podcasts) {
              err
                ? res.json({
                    result: "Sorry, An unknown error has occured!",
                  })
                : res.json(podcasts);
            });
        } else {
          res.json([]);
        }
      }
    }
  );
});

/* add a podcast. */
router.post("/", function (req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    let { name, artist, podcastFile, genre, description, cover } = fields;
    genre = genre.split(",");
    // getVideoDurationInSeconds(
    //   `${__dirname}/../media/podcasts/${podcastFile}`
    // ).then((duration) => {
    //get podcast duration
    const buffer = fs.readFileSync(
      `${__dirname}/../media/podcasts/${podcastFile}`
    );
    var duration = getMP3Duration(buffer);
    // duration = moment.duration(duration, 'milliseconds');
    // moment.duration(duration, 'milliseconds');
    // console.log(duration);
    // let hours = Math.floor(duration.asHours());
    // let mins = Math.floor(duration.asMinutes()) - hours * 60;
    // let seconds = Math.floor(duration.asSeconds()) - (hours * 60 * 60) - (mins * 60);
    //////
    // let seconds = Math.floor(duration % 60);
    // let mins = Math.floor(Math.floor(duration / 60) % 60);
    // let hours = Math.floor(Math.floor(duration / 60) / 60);

    // duration =
    //   (hours < 10 ? "0" + hours : hours) +
    //   ":" +
    //   (mins < 10 ? "0" + mins : mins) +
    //   ":" +
    //   (seconds < 10 ? "0" + seconds : seconds);
    console.log(duration);
    new PodcastModel({
      name,
      podcastFile,
      duration,
      artist,
      genre,
      description,
      cover,
    })
      .save()
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        console.log(error);
        res.json({
          result: "Sorry, An unknown error has occured!",
        });
      });

    // });
  });
});

/* update a podcast. */
router.put("/:_id", function (req, res) {
  let { _id } = req.params;
  let { name, artist, podcastFile, description, cover } = req.body;
  // genre = genre.split(",");
  let genre = req.body["genre[]"];

  PodcastModel.updateOne(
    { _id },
    {
      name,
      podcastFile,
      // duration,
      artist,
      genre,
      description,
      cover,
    }
  ).exec(function (err, podcast) {
    err
      ? res.json({
          result: "Sorry, An unknown error has occured!",
        })
      : res.json(podcast);
  });
});

/* delete a podcast. */
router.delete("/", function (req, res) {
  let { _id } = req.body;

  PodcastModel.findOne({ _id })
    .remove()
    .exec(function (err, podcast) {
      err
        ? res.json({
            result: "Sorry, An unknown error has occured!",
          })
        : res.json(podcast);
    });
});

module.exports = router;
