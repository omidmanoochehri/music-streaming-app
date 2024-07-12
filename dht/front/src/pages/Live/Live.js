import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Container } from "reactstrap";
import { Configs } from "../../configs";
import { ACTIVE_LIVE, SET_LIVE, DEACTIVE_LIVE } from "../../redux/action-types";
import { query } from "../../ajax";
import { browserName } from "react-device-detect";

const Live = (props) => {
  const { live, set_active_live, setLive, stopLive } = props;
  const [loading, setLoading] = useState(false);
  console.log(live?.channelData?.channel1?.podcast?.cover);
  const activeLive = (channelNumber) => {
    setTimeout(() => {
      set_active_live(channelNumber);
    }, 1000);
  };

  const playLive = () => {
    let audioEl = document.getElementById("livePlayer");
    // setTimeout(() => {
      audioEl.play();
      console.log("play");
    // }, 1000);
  };

  const channel = (channelNum) => {
    setLoading(true);
    const url = `/live/channel/${channelNum}`;
    query({
      url: url,
      data: { name: "" },
      method: "POST",
      success: (chLiveData) => {
        setLive(channelNum, chLiveData);
        setLoading(false);
      },
      error: (error) => {
        console.log(error);
      },
    });
  };
  useEffect(() => {
    channel(1);
    // channel(2);
  }, []);

  return (
    <Container>
      {loading ? (
        <div className="load"></div>
      ) : live ? (
        <div className="col-12">
          <div className="row text-center">
            <div className="channelCover col-lg-12 p-1">
              {live.channelData.channel1 &&
              live.channelData.channel1.podcast ? (
                <>
                  <div
                    className="channel channel1"
                    style={{
                      background: `url('${Configs.API_URL}:${Configs.API_PORT}/images/covers/${live.channelData.channel1.podcast.cover}')`,
                    }}
                    onClick={() => {
                      stopLive();
                      activeLive(1);
                      playLive();
                    }}
                  ></div>
                  <h2>{live.channelData.channel1.podcast.name}</h2>
                </>
              ) : (
                <>
                  <div
                    className="channel channel1"
                    style={{
                      background: `url('${Configs.API_URL}:${Configs.API_PORT}/images/covers/placeholder.jpg')`,
                    }}
                  ></div>
                  <h2>No Live</h2>
                </>
              )}
            </div>
            {/* 
            <div className="channelCover col-lg-6 bg-channel p-1">
              {live.channelData.channel2 &&
              live.channelData.channel2.podcast ? (
                <>
                  <div
                    className=" channel channel2"
                    style={{
                      background: `url('${Configs.API_URL}:${Configs.API_PORT}/images/covers/${live.channelData.channel2.podcast.cover}')`,
                    }}
                    onClick={() => {
                      stopLive();
                      activeLive(2);
                      playLive();
                    }}
                  ></div>
                  <h2>{live.channelData.channel2.podcast.name}</h2>
                </>
              ) : (
                <>
                  <div
                    className=" channel channel2"
                    style={{
                      background: `url('${Configs.API_URL}:${Configs.API_PORT}/images/covers/placeholder.jpg')`,
                    }}
                  ></div>
                  <h2>No Live</h2>
                </>
              )}
            </div> */}
          </div>
        </div>
      ) : (
        ""
      )}
    </Container>
  );
};

const mapStateToProps = (state) => {
  return {
    live: state.liveReducer,
  };
};

const mapDispatchToProps = (dispatcher) => {
  return {
    set_active_live: (channelNumber) =>
      dispatcher({ type: ACTIVE_LIVE, payload: channelNumber }),
    setLive: (channelNumber, channelData) =>
      dispatcher({ type: SET_LIVE, payload: { channelNumber, channelData } }),
    stopLive: () => dispatcher({ type: DEACTIVE_LIVE }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Live);
