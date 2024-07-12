module.exports = function (server) {

    var ffmpeg = require('ffmpeg');

    
    try {
        new ffmpeg(`${__dirname}/../media/'Tehran Night #272 Shemroon.mp3'` , function (err, podcast) {
            if (!err) {
                podcast
                .setAudioBitRate(128)
                podcast.setAudioChannels(2)
                podcast.setVideoFormat("flv")
                podcast.addCommand("-f","flv")
                podcast.addCommand("-ar","44100")
                podcast.addCommand("-preset","veryfast")
                podcast.addCommand("-tune","zerolatency")
                podcast.addCommand("-c:a","aac")
                podcast.addCommand("-c:v","libx264")
                podcast.fnAddWatermark(`${__dirname}/../public/images/covers/House.jpg`)
                podcast.setOutput = "rtmp://localhost/live/CHANNEL1";
                podcast.metadata.synched=true
                podcast.metadata.video.stream=1
                //     podcast.save('rtmp://localhost/live/CHANNEL1', function (error, file) {
                //     console.log(error)
                //     if (!error)
                //         console.log('Video file: ' + file);
                // });
                // console.log(podcast)
                console.log('The podcast is ready to be processed');
            } else {
                console.log('Error: ' + err);
            }
        });
    } catch (e) {
        console.log(e.code);
        console.log(e.msg);
    }
    

}

