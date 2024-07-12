import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Container } from "reactstrap";
import { query } from "../../ajax";
import {
  SET_PARENT_PATH,
  SET_SEARCH,
  SET_PATH,
  SET_SELECTED_PODCAST,
} from "../../redux/action-types";
import { Configs } from "../../configs";
import moment from "moment";

const Search = (props) => {
  const {
    search,
    set_search,
    set_path,
    set_parent_path,
    parentPath,
    set_selected_podcast,
  } = props;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (parentPath !== "/search") set_search([]);
  }, []);

  const dataSearch = (data) => {
    setLoading(true);
    set_search([]);
    query({
      // auth: auth.isAuthenticated,
      url: `/podcasts/search/${data}`,
      method: "GET",
      success: (result) => {
        set_search(result);
        setLoading(false);
      },
    });
  };

  const goPodcast = (valPod) => {
    set_selected_podcast(valPod);
    set_path("/podcast");
    set_parent_path("/search");
  };

  return (
    <Container>
      <div className="mt-3 mt-sm-5">
        <h2 className="d-none d-sm-block text-white">Search Your Podcast</h2>
        <input
          type="text"
          name="search"
          className="form-control"
          onChange={(e) => {
            dataSearch(e.target.value);
          }}
          placeholder="Type podcast name here..."
        />
        <div className="m-auto pt-4 pb-5 pageContent">
          {loading ? <div className="load"></div> : ""}
          {search && search.length > 0 ? (
            search.map((val, index) => {
              return (
                <div
                  key={index}
                  className="text-center text-white border-dark border-bottom search-item"
                >
                  <div
                    className="row m-auto p-2 justify-content-center align-items-center"
                    onClick={() => {
                      goPodcast(val);
                    }}
                  >
                    <div className="col-4 p-0">
                      <div className="search-img">
                        <img
                          className="w-100"
                          src={`${Configs.API_URL}:${Configs.API_PORT}/images/covers/${val.cover}`}
                          alt={val.name}
                        />
                      </div>
                    </div>
                    <div className="col-8 p-0">
                      <div className="row pl-4 text-left text-lg-center">
                        <div className="col-sm-12 col-lg-4 p-0">{val.name}</div>
                        <div className="col-sm-12 col-lg-4 p-0 text-secondary">
                          <small>
                            {moment
                              .utc(parseInt(val.duration))
                              .format("HH:mm:ss")}
                          </small>
                        </div>
                        <div className="col-sm-12 col-lg-4 p-0">
                          <small>{val.artist.name}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <h5 className="text-secondary text-white">No podcast found!</h5>
          )}
        </div>
      </div>
    </Container>
  );
};

const mapStateToProps = (state) => {
  return {
    search: state.searchReducer.search,
    parentPath: state.menuReducer.parentPath,
  };
};

const mapDispatchToProps = (dispatcher) => {
  return {
    set_search: (search) => dispatcher({ type: SET_SEARCH, payload: search }),
    set_selected_podcast: (pod) =>
      dispatcher({ type: SET_SELECTED_PODCAST, payload: pod }),
    set_path: (path) => dispatcher({ type: SET_PATH, payload: path }),
    set_parent_path: (path) =>
      dispatcher({ type: SET_PARENT_PATH, payload: path }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
