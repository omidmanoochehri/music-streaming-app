import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {composeWithDevTools} from 'redux-devtools-extension';
import {root_reducer} from "./reducers";

export const store = createStore(root_reducer, composeWithDevTools(applyMiddleware(thunk)));