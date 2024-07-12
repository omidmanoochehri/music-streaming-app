import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import ReactPlayer from "react-player";
import { DEACTIVE_LIVE, PLAY_PODCAST } from "../redux/action-types";
import { Configs } from "../configs";
import AudioMotionAnalyzer from "audiomotion-analyzer";
import ReactHlsPlayer from "react-hls-player";
import { osName } from "react-device-detect";

const LivePlayer = (props) => {
  const { live, stopLive, play_podcast } = props;
  const [liveData, setLiveData] = useState({});
  const audioAnimation = useRef(null);
  const player = useRef(null);
  const activedChannelData =
    live.activedLive && live.activedLive === 1
      ? live.channelData.channel1
      : live.channelData.channel2;

  const stopPlaying = () => {
    stopLive();
    play_podcast(false);
  };

  const livePlayer = useRef();

  // const codecString = 'video/mp4; codecs="avc1.42C028"';

  // var mediaSource = new MediaSource();
  // var buffer = null;
  // var queue = [];
  // var bufferArray = [];

  // const updateBuffer = () => {
  //     if (queue.length > 0 && !buffer.updating) {
  //         buffer.appendBuffer(queue.shift());
  //     }
  // }

  // const sourceBufferHandle = (URL) => {
  //     buffer = mediaSource.addSourceBuffer(codecString);
  //     buffer.mode = 'sequence';

  //     buffer.addEventListener('update', function () { // Note: Have tried 'updateend'
  //         // console.log('update');
  //         updateBuffer();
  //     });

  //     buffer.addEventListener('updateend', function () {
  //         // console.log('updateend');
  //         updateBuffer();
  //     });

  //     initWS(URL);
  // }

  // const initWS = (liveURL) => {
  //     if (liveURL) {
  //         var ws = new WebSocket(liveURL, 'echo-protocol');
  //         ws.binaryType = "arraybuffer";

  //         ws.onopen = function () {
  //             console.info('WebSocket connection initialized');
  //         };

  //         ws.onmessage = function (event) {
  //             // console.info('Recived WS message.', event);

  //             if (typeof event.data === 'object') {
  //                 if (buffer.updating || queue.length > 0) {
  //                     queue.push(event.data);
  //                 } else {
  //                     buffer.appendBuffer(event.data);
  //                     livePlayer.current && livePlayer.current.play().catch(e => console.log(e));
  //                 }
  //             }
  //         };
  //     }
  // }

  // useEffect(() => {
  //     if (livePlayer.current) livePlayer.current.src = window.URL.createObjectURL(mediaSource);
  // }, [])

  // useEffect(() => {
  //     var audioMotion = new AudioMotionAnalyzer(
  //         document.getElementById("audioAnimation"),
  //         {
  //             source: document.querySelector("#livePlayer video"),
  //             // height: 60,
  //             mode: 3,
  //             barSpace: .6,
  //             showLeds: true,
  //             showScaleX: false
  //             // radial:true

  //         }
  //     )
  // }, [])

  useEffect(() => {
    // const livePodcastURL = `${Configs.API_URL}:${Configs.LIVE_PORT}/live/${activedChannelData.podcast.name.replace("#", '').replace(/\s/g, "-")}-${activedChannelData.TOKEN}.flv`;
    const livePodcastURL = `${Configs.WS}:${Configs.LIVE_PORT}/live/ch${live?.activedLive}`; //`[live.activedLive - 1]}`;
    if (liveData.URL !== livePodcastURL) {
      setLiveData({
        URL: livePodcastURL,
        name: activedChannelData.podcast.name,
        duration: activedChannelData.podcast.duration,
      });
      // mediaSource.addEventListener('sourceopen', () => sourceBufferHandle(livePodcastURL))
      // if (livePlayer.current) livePlayer.current.src = window.URL.createObjectURL(mediaSource);
      document.getElementById("livePlayer").play();
    }
  }, [live.isLive,live.activedLive]);

  useEffect(() => {
    if (livePlayer.current) {
      livePlayer.current.play();
      livePlayer.current.addEventListener("pause", () => {
        stopLive();
        play_podcast(false);
      });
    }
  }, [livePlayer]);

  return (
    <div className="livePlayerContainer" style={{display:live.isLive ? "block" : "none"}}>
      {/* <ReactHlsPlayer
             id="livePlayer"
             src={`https://app.deephousetehran.net/stream/live${live.activedLive}.m3u8`}
             autoPlay={true}
             controls={true}
             width="100%"
             height="auto"
            /> */}
      {/* 
      <ReactHlsPlayer
        playerRef={livePlayer}
        id="livePlayer"
        src={`${window.location.origin}/stream/ch${live.activedLive}/hls/live${live.activedLive}.m3u8`} //{`${Configs.LIVE_URL}/live/ch${live.activedLive}.flv`}//?sign=${activedChannelData.TOKEN}`}
        width="100%"
        height="auto"
        autoPlay={true}
        controls={osName === "iOS"}
        controlsList="nofullscreen"
        // playing={true}
        playsInline
        webkitPlaysInline
        hlsConfig={{
          autoStartLoad: true,
          lowLatencyMode: true,
        }}
        style={{ display: osName === "iOS" ? "block" : "none", height: osName === "iOS" ? 100 : 60 }}
        poster={`${Configs.API_URL}:${Configs.API_PORT}/images/covers/${
          live.channelData[`channel${live.activedLive}`].podcast.cover
        }`}
      /> */}
      <audio
        id="livePlayer"
        ref={livePlayer}
        src={"https://test.deephousetehran.net/stream/" + live?.activedLive}
        // autoPlay
        preload="none"
        controls
        // style={{ display: "block" }}
      />
      {/* <video ref={livePlayer} style={{ display: "none" }} controls></video> */}
      <div
        id="audioAnimation"
        ref={audioAnimation}
        style={{ display: "none" }}
      ></div>
      <button
        id="playLive"
        aria-label="Play"
        className="rhap_button-clear rhap_main-controls-button rhap_play-pause-button"
        type="button"
        onClick={() => stopPlaying()}
      >
        {/* <svg xmlns="http://www.w3.org/2000/svg" focusable="false" style={{ transform: "rotate(360deg)" }} width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M10 16.5v-9l6 4.5M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2z" fill="currentColor"></path></svg> */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
          style={{ transform: "rotate(360deg)" }}
          width="1em"
          height="1em"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 24 24"
        >
          <path
            d="M15 16h-2V8h2m-4 8H9V8h2m1-6A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2z"
            fill="currentColor"
          ></path>
        </svg>
      </button>
      <div className="liveInfo text-secondary">
        <h6 className="m-0">{liveData?.name}</h6>
        <span className="duration">{liveData?.duration}</span>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    live: state.liveReducer,
  };
};

const mapDispatchToProps = (dispatcher) => {
  return {
    stopLive: () => dispatcher({ type: DEACTIVE_LIVE }),
    play_podcast: (status) =>
      dispatcher({ type: PLAY_PODCAST, payload: status }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LivePlayer);
