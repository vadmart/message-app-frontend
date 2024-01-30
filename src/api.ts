import axios from "axios";
import { BaseHTTPURL } from "./config";
import { Message, isAMessage } from "./types/MessageType";
import { Chat_ } from "./types/ChatType";
import { err } from "react-native-svg/lib/typescript/xml";

export const deleteMessage = async (message: Message) => {
    return axios.delete(`${BaseHTTPURL}chat/${message.chat}/message/${message.public_id}/`, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}

export const sendMessage = async (message: Message, method="POST") => {
    const formData = new FormData();
    if (message.public_id) {
        formData.append("public_id", message.public_id);
    }
    if (message.content) {
        formData.append("content", message.content);
    }
    if (message.file) {
        formData.append("file", message.file);
    }
    if (message.chat) {
        formData.append("chat", message.chat)
    } else {
        formData.append("second_user", message.sender.public_id)
    }
    const url = (method == "POST") ? BaseHTTPURL + `chat/${message.chat}/message/` : BaseHTTPURL + `chat/${message.chat}/message/${message.public_id}/`;
    return axios(url,
        {
            method: method,
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data",
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
            const data = (await sendMessage(messages[errorMessagesIndexes[k]])).data;
            messages[errorMessagesIndexes[k]] = data;
        }
    }
}