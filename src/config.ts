import axios from "axios";
export const axiosWithConnectionRetry = axios.create();

axiosWithConnectionRetry.interceptors.response.use(undefined, async (err) => {
    const {config, message} = err;
    if (config.retry === undefined)
        config.retry = 50;
    else if (config.retry === 0) {
        console.log("Message hasn't been sent!");
        return Promise.reject()
    }
    config.retry -= 1;
    if (!(message.includes("Network Error") || message.includes("timeout"))) {
        return Promise.reject(err);
    }
    const delayedRequest = new Promise((resolve) => {
        setTimeout(() => {
            console.log("retry performing request with URL " + config.url);
            resolve(undefined);
        }, 1000)
    })
    return delayedRequest.then(() => axiosWithConnectionRetry(config))
})
export const BaseHTTPURL = "http://localhost:8000/api/v1/";
export const BaseWebsocketURL = "ws://localhost:8000/ws/chat/";
const ScreenNames = {
    REGISTRATION: "Registration",
    LOGIN: "Login",
    MAIN_SCREEN: "MainScreen",
    CHATS_SCREEN: "ChatsScreen",
    MESSAGES_SCREEN: "MessagesScreen",
    VERIFICATION_SCREEN: "VerificationScreen"
};
export default ScreenNames;