var express = require('express');
var router = express.Router();
// var fs = require('fs');
// var stat = fs.statSync("stream.mp3");

const fs = require('fs'),
  Throttle = require('throttle'),
  ffprobe = require('ffprobe'),
  ffprobeStatic = require('ffprobe-static');



  // var lame = require('lame');
  // var audio = require('osx-audio');

  // // create the Encoder instance
  // var encoder = new lame.Encoder({
  //   // input
  //   channels: 2,        // 2 channels (left and right)
  //   bitDepth: 16,       // 16-bit samples
  //   sampleRate: 44100,  // 44,100 Hz sample rate

  //   // output
  //   bitRate: options.bitrate,
  //   outSampleRate: options.samplerate,
  //   mode: (options.mono ? lame.MONO : lame.STEREO) // STEREO (default), JOINTSTEREO, DUALCHANNEL or MONO
  // });

  // var input = new audio.Input();
  // input.pipe(encoder);




router.get('/',
    require("connect-ensure-login").ensureLoggedIn("/auth/login"), 
    function (req, res) {
  res.render('stream', { title: 'Express' });
})






// const readableStream = fs.createReadStream("../stream.mp3")
// router.get('/stream', function (req, res) {
//   res.set({
//     'Content-Type': 'audio/mpeg3',
//     'Transfer-Encoding': 'chunked'
//   });
  // readableStream.pipe(res);
  // console.log(file)
  // encoder.pipe(res);


  // console.log("omid", inputStream.pipe(res))
  // const bitRate = ffprobe('../stream.mp3', { path: ffprobeStatic.path }, function(err, info){
  //     console.log(info.streams[0].bit_rate);
  // });
  // const readable = fs.createReadStream('../stream.mp3');
  // const throttle = new Throttle(bitRate / 8);
  // const writables = [writable1, writable2, writable3];

  // readable.pipe(throttle).on('data', (chunk) => {
  //       //  for (const writable of writables) {
  //       //  writable.write(chunk);
  //       console.log(chunk)
  //     //  }
  //   });

// });

// /* GET home page. */
// router.get('/',
//   function (req, res, next) {
//     res.setHeader('Content-Type', 'audio/mpeg');
//     // res.setHeader('Content-Length', stat.size);
//     next();
//   }, function (req, res, next) {
//     var file = fs.createReadStream("stream.mp3");
//     console.log(file);
//     // res.send(file)
//     res.pipe(file);
//     // res.render('index', { title: 'Express' });
//   });

// // var encoder = require('encoder');
// // var audio = require('osx-audio');

// // // create the Encoder instance
// // var proc = encoder({
// //   // input
// //   channels: 2,        // 2 channels (left and right)
// //   bitDepth: 16,       // 16-bit samples
// //   sampleRate: 44100,  // 44,100 Hz sample rate

// //   // output
// //   bitRate: options.bitrate,
// //   outSampleRate: options.samplerate,
// //   mode: (options.mono ? lame.MONO : lame.STEREO) // STEREO (default), JOINTSTEREO, DUALCHANNEL or MONO
// // });

// // var input = new audio.Input();
// // input.pipe(proc);

// // router.get('/stream.mp3', function (req, res) {
// //   res.set({
// //     'Content-Type': 'audio/mpeg3',
// //     'Transfer-Encoding': 'chunked'
// //   });
// //   proc.pipe(res);
// // });



module.exports = router;
