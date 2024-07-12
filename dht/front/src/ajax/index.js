import axios from 'axios';
import { Configs } from '../configs';

export const query = (obj, recursive = false) => {
    const payload = { auth: false, ...obj };
    if (payload.success && typeof payload.success === 'function' && payload.url) {
        if (!recursive) payload.url = Configs.API_URL + ":" + Configs.API_PORT + payload.url;
        payload.method = payload.method || 'POST';
        if (payload.auth) payload.headers = { ...payload.headers, access_token: localStorage.getItem('access_token') }
        axios(payload).then(response => {
            payload.success(response.data);
        }).catch(error => {
            const error_response = (error && error.response) || {};
            switch (error_response.status) {
                case 401: {
                    console.warn('Refresh');
                    // refresh_token()
                    //     .then(response => {
                    //         const {access_token, refresh_token} = response.data.data;
                    //         console.warn('Update Token');
                    //         localStorage.setItem('access_token', access_token);
                    //         localStorage.setItem('refresh_token', refresh_token);
                    //         query(payload, true);
                    //     })
                    //     .catch(() => {
                    //         console.warn('Refresh Error');
                    //         typeof payload.error === 'function' && payload.error(error_response);
                    //         localStorage.removeItem('access_token');
                    //         localStorage.removeItem('refresh_token');
                    //     })
                    break;
                }
                default: {
                    typeof payload.error === 'function' && payload.error(error_response);
                }
            }
        })
    } else console.error('Require field success, url');
}


// query({
//     url: '/users/list',
//     success: response => {
//         console.log(response);
//     }
// })