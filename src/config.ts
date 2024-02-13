import axios from "axios";
export const axiosWithConnectionRetry = axios.create();

axiosWithConnectionRetry.interceptors.response.use(undefined, async (err) => {
    const {config, message} = err;
    console.log("Axios config and message: ");
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
export const BaseHTTPURL = "https://d193-178-150-167-216.ngrok-free.app/api/v1/";
export const BaseWebsocketURL = "wss://d193-178-150-167-216.ngrok-free.app/ws/chat/";
const ScreenNames = {
    REGISTRATION: "Registration",
    LOGIN: "Login",
    MAIN_SCREEN: "MainScreen",
    CHATS_SCREEN: "ChatsScreen",
    MESSAGES_SCREEN: "MessagesScreen"
};
export default ScreenNames;