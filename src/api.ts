import axios from "axios";
import { BaseHTTPURL } from "./config";

export const deleteMessage = async (messageId: string) => {
    return axios.delete(`${BaseHTTPURL}message/${messageId}/`, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}