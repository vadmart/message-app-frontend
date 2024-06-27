import axios from "axios";
import { storage } from "./Storage";
export const modAxios = axios.create();
const httpOrigin = process.env.EXPO_PUBLIC_HTTP_ORIGIN;
const webSocketOrigin = process.env.EXPO_PUBLIC_WEBSOCKET_ORIGIN;
export const BaseHTTPURL = `${httpOrigin}api/v1/`;
export const BaseWebsocketURL = `${webSocketOrigin}ws/chat/`;
export const ScreenNames = {
    REGISTRATION: "Registration",
    LOGIN: "Login",
    MAIN_SCREEN: "MainScreen",
    CHATS_SCREEN: "ChatsScreen",
    MESSAGES_SCREEN: "MessagesScreen",
    VERIFICATION: "Verification"
};

modAxios.interceptors.response.use(undefined, async (error) => {
    const prevRequest = error?.config;
    if (error?.response?.status === 401 && !prevRequest?.sent) {
        prevRequest.sent = true;
        const auth = JSON.parse(storage.getString("auth"));
        const refresh = auth.refresh;
        try {
            const response = await axios.post(`${BaseHTTPURL}auth/token/refresh/`, { refresh });
            const access = response.data.access;
            console.log(`Access: ${access}`);
            // Установите новый токен для следующего запроса
            prevRequest.headers.Authorization = `Bearer ${access}`;
            // Установите новый токен для всех последующих запросов
            modAxios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            auth.access = access;
            storage.set("auth", JSON.stringify(auth));
            // Повторите оригинальный запрос с новым токеном
            return modAxios(prevRequest);
        } catch (refreshError) {
            // Если обновление токена не удалось, выполните разлогин или другую обработку
            console.error('Ошибка при обновлении токена:', refreshError);
            return Promise.reject(refreshError);
        }
    }
    return Promise.reject(error);
    })
