import { SET_CATEGORIES } from "../action-types";

const initialState = {
    categories: []
};

export const categoryReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_CATEGORIES: {
            return {
                categories: action.payload
            }
        }
        default: {
            return state;
        }
    }
}