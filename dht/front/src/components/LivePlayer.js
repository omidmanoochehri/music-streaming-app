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
  const [liveURL, setLiveURL] = useState(
    Configs.LIVE_URL + "/1"
  );
  const audioAnimation = useRef(null);
  const livePlayer = useRef();

  const activedChannelData =
    live.activedLive && live.activedLive === 1
      ? live.channelData.channel1
      : live.channelData.channel2;

  const stopPlaying = () => {
    stopLive();
    play_podcast(false);
    document.getElementById("livePlayer").pause();
  };

  useEffect(() => {
    if (live.activedLive) {
      const livePodcastURL = Configs.LIVE_URL + "/" + live.activedLive;
      setLiveURL(livePodcastURL);
      if (liveData.URL !== livePodcastURL) {
        setLiveData({
          URL: livePodcastURL,
          name: activedChannelData.podcast.name,
          duration: activedChannelData.podcast.duration,
        });

        // document.getElementById("livePlayer").play();
        // document.getElementById("livePlayer").src=livePodcastURL;
        if (livePlayer.current) {
          // livePlayer.current.play();
          // livePlayer.current.src=livePodcastURL;
          livePlayer.current.addEventListener("pause", () => {
            stopLive();
            play_podcast(false);
          });
        }
      }
    }
  }, [live.isLive]);

  return (
    <div
      className="livePlayerContainer"
      style={{ display: live.isLive ? "block" : "none" }}
    >
      <audio
        id="livePlayer"
        ref={livePlayer}
        src={liveURL}
        // autoPlay
        preload="none"
        controls
        // style={{ display: "block" }}
      />

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
