import {
  SET_PODCASTS,
  SET_PODURL,
  PLAY_PODCAST,
  SET_SELECTED_PODCAST,
  SET_SELECTED_CAT,
} from "../action-types";

const initialState = {
  podcasts: [],
  selectedPodcast: null,
  url: "",
  isPlaying: false,
  selectedCat: null,
  playingPodcast: null,
};

export const podcastsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PODCASTS: {
      return {
        ...state,
        podcasts: action.payload,
      };
    }
    case SET_PODURL: {
      return {
        ...state,
        url: action.payload,
      };
    }
    case PLAY_PODCAST: {
      return {
        ...state,
        isPlaying: !!action.payload,
        playingPodcast: action.payload || null,
      };
    }
    case SET_SELECTED_PODCAST: {
      return {
        ...state,
        selectedPodcast: action.payload,
      };
    }
    case SET_SELECTED_CAT: {
      return {
        ...state,
        selectedCat: action.payload,
      };
    }
    default: {
      return state;
    }
  }
};
