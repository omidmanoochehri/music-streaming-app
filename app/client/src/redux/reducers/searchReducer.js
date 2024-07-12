import { SET_SEARCH } from "../action-types";

const initialState = {
    search: []
};

export const searchReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_SEARCH: {
            return {
                search: action.payload
            }
        }
        default: {
            return state;
        }
    }
}