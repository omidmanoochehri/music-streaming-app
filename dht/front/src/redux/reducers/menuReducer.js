import { SET_PATH,SET_PARENT_PATH } from "../action-types";

const initialState = {
    activedPath: '/',
    parentPath:"/"
};

export const menuReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_PATH: {
            return {
                activedPath: action.payload,
                parentPath: state.parentPath,
            }
        }
        case SET_PARENT_PATH: {
            return {
                parentPath: action.payload,
                activedPath: state.activedPath,
            }
        }
        default: {
            return state;
        }
    }
}