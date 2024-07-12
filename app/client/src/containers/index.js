import React, { useEffect, useState, useRef } from "react";
import Menu from "./MenuComponent";
import Player from "../components/Player";
import { connect } from "react-redux";
import LivePlayer from "../components/LivePlayer";

const Master = (props) => {
  const { live, urlPodcast, isPlaying } = props;
  const [masterOpacity, setMasterOpacity] = useState(0);

  useEffect(() => {
    setMasterOpacity(1);
  }, []);

  return (
    <div style={{ transition: "2000ms", opacity: masterOpacity }}>
      <Menu />
      <div className="pt-0 pt-lg-3">{props.children}</div>
      <div
        className="playerContainer"
        style={{ display: live.isLive || isPlaying ? "block" : "none" }}
      >
        <LivePlayer />
        
        {!live.isLive && isPlaying && <Player urlPodcast={urlPodcast} />}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    podcasts: state.podcastReducer.podcasts,
    urlPodcast: state.podcastReducer.url,
    live: state.liveReducer,
    isPlaying: state.podcastReducer.isPlaying,
  };
};

const mapDispatchToProps = (dispatcher) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Master);
