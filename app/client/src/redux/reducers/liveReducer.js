import { SET_LIVE, ACTIVE_LIVE ,DEACTIVE_LIVE} from "../action-types";

const initialState = {
    isLive: false,
    channelData: {
        channel1: {},
        channel2: {}
    },
    activedLive: null
};

export const liveReducer = (state= initialState, action) => {
    switch (action.type) {
        case DEACTIVE_LIVE: {
            return {
                channelData: state.channelData,
                isLive: false,
                activedLive: action.payload
            }
        }
        case ACTIVE_LIVE: {
            return {
                channelData: state.channelData,
                isLive: true,
                activedLive: action.payload
            }
        }
        case SET_LIVE: {
            return {
                isLive: state.isLive,
                channelData: action.payload.channelNumber === 1 ?
                    {
                        channel1: action.payload.channelData,
                        channel2: state.channelData.channel2
                    }
                    :
                    {
                        channel1: state.channelData.channel1,
                        channel2: action.payload.channelData
                    },
                activedLive: state.activedLive
            }
        }
        default: {
            return state;
        }
    }
}