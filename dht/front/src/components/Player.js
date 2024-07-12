import React, { useRef, useState } from "react";
import { connect } from "react-redux";
import { PLAY_PODCAST, DEACTIVE_LIVE } from "../redux/action-types";
import AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import ReactPlayer from "react-player";
import moment from "moment";
import { useEffect } from "react";

const Player = (props) => {
  const {
    live,
    isPlaying,
    play_podcast,
    urlPodcast,
    stopLive,
    playingPodcast,
  } = props;
  // const [token, setToken] = useState(moment().format("yyyymm"));
  const [URL, setURL] = useState(urlPodcast );//"?token=" + token

  const stopPlaying = () => {
    play_podcast(false);
    stopLive();
  };

  // const playPodcast = () => {
  //   stopLive();
  //   play_podcast(true);
  // };

  useEffect(() => {
    // setInterval(() => {
    //   var audioPlayer = document.querySelector(
    //     ".podcastPlayerContainer audio"
    //   );
    //   let oldCurrentTime = audioPlayer.currentTime;
    //   setURL(urlPodcast+"?token="+moment().format("yyyymm"))
    //   audioPlayer.currentTime = oldCurrentTime;
    // }, 60000);
  }, []);

  // const handleListen = (data) => {
  //   // console.log("listen",data)
  //   var audioPlayer = document.querySelector(".podcastPlayerContainer audio");
  //   let oldCurrentTime = audioPlayer.currentTime;
  //   setURL(urlPodcast + "?token=" + moment().format("yyyymm"));
  //   if (token !== moment().format("yyyymm")) {
  //     audioPlayer.currentTime = oldCurrentTime;
  //     setToken(moment().format("yyyymm"));
  //   }
  // };

  return (
    // <AudioPlayer
    //     // autoPlay
    //     autoPlay={isPlaying ? true : false}
    //     src={urlPodcast}
    //     onPlay={()=>{playPodcast()}}
    // // other props here
    // />
    <div className="livePlayerContainer podcastPlayerContainer">
      {/* <ReactPlayer */}
      {/* <audio
        id="audioPlayer"
        Ref="audioPlayer"
        src={urlPodcast}
        // width="100%"
        // height="auto"
        // playing={true}
        preload="none"
        controls
      /> */}
      <AudioPlayer
        id="audioPlayer"
        // autoPlay
        src={URL}
        // onListen={handleListen}
        // onPlay={e => console.log("onPlay")}
        onPause={(e) => {
          stopPlaying();
        }}
        showJumpControls={false}
        customAdditionalControls={[]}
        showDownloadProgress={false}
        header={playingPodcast?.name}
        // layout="horizontal"
        // other props here
        preload="none"
        // mse={{
        //   srcDuration: 23
        // }}
        // autoPlayAfterSrcChange
      />
      {/* <button
        id="playLive"
        aria-label="Play"
        className="rhap_button-clear rhap_main-controls-button rhap_play-pause-button"
        type="button"
        onClick={() => {stopPlaying()}}
      > */}
      {/* <svg xmlns="http://www.w3.org/2000/svg" focusable="false" style={{ transform: "rotate(360deg)" }} width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M10 16.5v-9l6 4.5M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2z" fill="currentColor"></path></svg> */}
      {/* <svg
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
        </svg> */}
      {/* </button> */}
      {/* <div className="liveInfo text-secondary">
        <h6 className="m-0">{playingPodcast?.name}</h6>
        <span className="duration">{playingPodcast?.duration}</span>
      </div> */}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    isPlaying: state.podcastReducer.isPlaying,
    playingPodcast: state.podcastReducer.playingPodcast,
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

export default connect(mapStateToProps, mapDispatchToProps)(Player);
