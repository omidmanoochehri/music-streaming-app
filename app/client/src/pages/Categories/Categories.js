import React, { useState, useEffect } from "react";
import { Container } from "reactstrap";
import { query } from "../../ajax/index";
import { connect } from "react-redux";
import {
  SET_CATEGORIES,
  SET_PARENT_PATH,
  SET_PATH,
  SET_PODCASTS,
  SET_SELECTED_CAT,
} from "../../redux/action-types";
import { Configs } from "../../configs";

const Categories = (props) => {
  const {
    categories,
    set_categories,
    set_podcasts,
    set_path,
    set_parent_path,
    set_selected_cat,
  } = props;
  const [loading, setLoading] = useState(false);

  const url = "/categories";
  useEffect(() => {
    if (!categories.length) {
      setLoading(true);
      query({
        // auth: auth.isAuthenticated,
        url: url,
        method: "GET",
        success: (result) => {
          const json = result;
          set_categories(json);
          setLoading(false);
        },
      });
    }
  }, []);

  // const { history } = useHistory();
  const getPodcasts = (cat) => {
    const url = "/podcasts/category/" + cat;
    setLoading(true);
    query({
      // auth: auth.isAuthenticated,
      url: url,
      method: "GET",
      success: (result) => {
        const json = result;
        set_podcasts(json);
        set_path("/podcastsList");
        set_parent_path("/categories");
        set_selected_cat(cat);
        setLoading(false);
      },
    });
  };

  return (
    <Container>
      <div className="categoryContianer row justify-content-lg-center justify-content-start">
        {loading ? (
          <div className="load"></div>
        ) : (
          categories.map((val, index) => {
            // console.log(val.cover);
            return (
              <div
                className="col-lg-4 col-6 p-0"
                key={index}
                onClick={() => {
                  getPodcasts(val.name);
                }}
              >
                <div
                  className="text-center text-white category_box rounded"
                  style={{
                    background:
                      val.cover.substr(0, 1) == "#"
                        ? val.cover
                        : `url(${Configs.API_URL}:${Configs.API_PORT}/images/covers/${val.cover})`,
                  }}
                >
                  <div>{val.cover.substr(0, 1) == "#" ? val.name : ""}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Container>
  );
};

const mapStateToProps = (state) => {
  return {
    categories: state.categoryReducer.categories,
  };
};

const mapDispatchToProps = (dispatcher) => {
  return {
    set_categories: (cats) =>
      dispatcher({ type: SET_CATEGORIES, payload: cats }),
    set_podcasts: (podcast) =>
      dispatcher({ type: SET_PODCASTS, payload: podcast }),
    set_path: (path) => dispatcher({ type: SET_PATH, payload: path }),
    set_parent_path: (path) =>
      dispatcher({ type: SET_PARENT_PATH, payload: path }),
    set_selected_cat: (cat) =>
      dispatcher({ type: SET_SELECTED_CAT, payload: cat }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Categories);
