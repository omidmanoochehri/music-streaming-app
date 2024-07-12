import React, { useEffect } from "react";
import { Button, Container, Row } from "reactstrap";
import { query } from "../../ajax";
import { connect } from "react-redux";
import {
  SET_PODURL,
  DEACTIVE_LIVE,
  PLAY_PODCAST,
  SET_PATH,
} from "../../redux/action-types";
import { FaPlay } from "@react-icons/all-files/fa/FaPlay";
import { FaPause } from "@react-icons/all-files/fa/FaPause";
import { Configs } from "../../configs";
import { MdKeyboardBackspace } from "@react-icons/all-files/md/MdKeyboardBackspace";
import { useState } from "react";
import moment from "moment";

const Podcast = (props) => {
  const {
    PD,
    set_url,
    stopLive,
    play_podcast,
    parentPath,
    set_path,
    isPlaying,
    playingPodcast,
  } = props;
  const [isPodcastLoaded, setIsPodcastLoaded] = useState(
    isPlaying && playingPodcast.name === PD.name
  );
  const reuestPodcastPathURL = `${Configs.API_URL}:${Configs.API_PORT}/podcasts/play/${window.btoa(PD.podcastFile)}`;

  const togglePodcast = () => {
    stopLive();
    var livePlayer = document.getElementById("livePlayer");
    livePlayer.pause();

    if (!isPlaying || playingPodcast.name !== PD.name) {
      set_url(reuestPodcastPathURL);
      play_podcast(PD);
      setTimeout(() => {
        var audioPlayer = document.querySelector(
          ".podcastPlayerContainer audio"
        );
        audioPlayer?.play();
        audioPlayer?.addEventListener("playing", () => {
          setTimeout(() => {
            console.log("playing");
            setIsPodcastLoaded(true);
          }, 4000);
        });
      }, 1000);
    } else {
      setIsPodcastLoaded(false);
      play_podcast(false);
      setTimeout(() => {
        var audioPlayer = document.querySelector(
          ".podcastPlayerContainer audio"
        );
        audioPlayer?.pause();
      }, 1000);
    }
  };

  // useEffect(() => {
  //   // query({
  //   //     url: reuestPodcastPathURL,
  //   //     method: "GET",
  //   //     success: podcastPATH => {
  //   //         set_url(`${Configs.LIVE_URL}:${Configs.PLAYBACK_PORT}${podcastPATH}`);
  //   //     },
  //   //     error: err => console.log(err)
  //   // });
  //   setIsPodcastLoaded(isPlaying && playingPodcast.name === PD.name);
  // }, [isPlaying,PD]);
  return (
    <Container>
      {
        <div className="position-fixed w-100 backBtnContainer row p-3 d-flex align-items-center justify-content-between">
          <Button
            color="secondary-outline"
            className="text-white"
            onClick={() =>
              set_path(
                parentPath === "/categories" ? "/podcastsList" : "/search"
              )
            }
          >
            <MdKeyboardBackspace /> Back
          </Button>
        </div>
      }
      <Row className="pageContent pt-5">
        <div className="col-12 mx-0">
          <div className="mt-3 row">
            <div className="col-lg-5 m-auto">
              <div
                className="podcast_image"
                // style={{ background: `url(${Configs.API_URL}:${Configs.API_PORT}/images/covers/${PD.cover})` }}
              >
                <img
                  className="w-100"
                  src={`${Configs.API_URL}:${Configs.API_PORT}/images/covers/${PD.cover}`}
                  alt={PD.name}
                />
              </div>
              <div
                className="text-white play-icon-podcast"
                onClick={togglePodcast}
              >
                {isPlaying && playingPodcast.name === PD.name ? (
                  // isPodcastLoaded ? (
                  <FaPause size={50} />
                ) : (
                  // )
                  //  : (
                  //   <div
                  //     className="load"
                  //     style={{ width: 50, height: 50, margin: 0 }}
                  //   />
                  // )
                  <FaPlay size={50} />
                )}
              </div>
            </div>
            <div className="col-lg-5 m-auto mt-2 text-left text-podcast-single pt-4">
              <p className="podcast_info text-white name-podcast m-0">
                <span className="singlePodcastLabel text-muted">Name: </span>
                <span className="podcast_info_value"> {PD.name}</span>
              </p>
              <p className="podcast_info text-white m-0">
                <span className="singlePodcastLabel text-muted">Artist: </span>
                <span className="podcast_info_value">{PD.artist.name}</span>
              </p>
              <p className="podcast_info text-white m-0">
                <span className="singlePodcastLabel text-muted">Duration: </span>
                <span className="podcast_info_value"> {moment.utc(parseInt(PD.duration)).format("HH:mm:ss")}</span>
              </p>
              <p className="podcast_info text-white m-0">
                <span className="singlePodcastLabel text-muted">Genre:</span>
                <span className="podcast_info_value"> {PD.genre?.map(row=>row.name)?.join(", ")}</span>
              </p>
              {PD.description && (
                <p className="podcast_info text-white m-0">
                  <span className="singlePodcastLabel text-muted">Description:</span>
                  <span className="podcast_info_value"> {PD.description}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </Row>
    </Container>
  );
};

const mapStateToProps = (state) => {
  return {
    PD: state.podcastReducer.selectedPodcast,
    parentPath: state.menuReducer.parentPath,
    isPlaying: state.podcastReducer.isPlaying,
    playingPodcast: state.podcastReducer.playingPodcast,
  };
};

const mapDispatchToProps = (dispatcher) => {
  return {
    set_url: (url) => dispatcher({ type: SET_PODURL, payload: url }),
    play_podcast: (status) =>
      dispatcher({ type: PLAY_PODCAST, payload: status }),
    stopLive: () => dispatcher({ type: DEACTIVE_LIVE }),
    set_path: (path) => dispatcher({ type: SET_PATH, payload: path }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Podcast);
