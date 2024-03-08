import { AxiosResponse } from "axios";
import { axiosWithConnectionRetry as axios } from "../../config";
import { BaseHTTPURL } from "../../config";
import { Message } from "../../types/MessageType";
import { Chat_ } from "../../types/ChatType";

export const deleteMessage = async (message: Message) => {
    return axios.delete(`${BaseHTTPURL}chat/${message.chat}/message/${message.public_id}/`, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}

export const createMessage = async (message: Message, method="POST", exclude_ws_channel="") => {
    const formData = new FormData();
    for (let key in message) {
        if (!!message[key] && key !== "sender") {
            formData.append(key, message[key]);
        }
    }
    formData.append("exclude_ws_channel", exclude_ws_channel);
    console.log(formData);
    const url = (method == "POST") ? BaseHTTPURL + `chat/${message.chat}/message/` : BaseHTTPURL + `chat/${message.chat}/message/${message.public_id}/`;
    return axios(url,
        {
            method,
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
}

export const resendMessagesFromChats = async (chats: Chat_[]) => {
    for (let i = chats.length - 1; i >= 0; --i) {
        const messages = chats[i].messages.results;
        const errorMessagesIndexes: number[] = [];
        for (let j = messages.length - 1; j >= 0; --j) {
            if (messages[j].hasSendingError) {
                errorMessagesIndexes.push(j);
                delete messages[j].hasSendingError;
            } else break;
        }
        for (let k = errorMessagesIndexes.length - 1; k >= 0; --k) {
            const data = (await createMessage(messages[errorMessagesIndexes[k]])).data;
            messages[errorMessagesIndexes[k]] = data;
        }
    }
}

export const markMessageAsRead = async (message_id: string) => {
    try {
        return axios.post(BaseHTTPURL + `message/${message_id}/read/`);
    } catch (e) {
        console.error(`Message was not marked as read due to error: ${e}`);
    }
}

export const markAllChatMessagesAsRead = (chat_id: string): Promise<AxiosResponse> => {
    return axios.post(BaseHTTPURL + `chat/${chat_id}/message/read-all-messages/`);
}
