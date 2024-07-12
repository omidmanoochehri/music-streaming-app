import {combineReducers} from 'redux';
import {categoryReducer} from "./categoryReducer";
import {podcastsReducer} from "./podcastsReducer";
import {liveReducer} from "./liveReducer";
import {menuReducer} from "./menuReducer";
import {searchReducer} from "./searchReducer";

export const root_reducer = combineReducers({
     categoryReducer,
     podcastReducer: podcastsReducer,
     liveReducer,
     menuReducer,
     searchReducer
});