import { Chat_ } from "@app/types/ChatType"
import { BaseHTTPURL } from "@app/config"
import { axiosWithConnectionRetry } from "@app/config"
import { Message } from "@app/types/MessageType"

export const createChat = async (chat: Chat_, message: Message = null) => {
    return axiosWithConnectionRetry.post(BaseHTTPURL + "chat/", {
        public_id: chat.public_id,
        first_user: chat.first_user.public_id,
        second_user: chat.second_user.public_id,
        messages: message ? {results: [message]} : null
    })
}

export const destroyChat = async (chat: Chat_) => {
    return axiosWithConnectionRetry.delete(BaseHTTPURL + `chat/${chat.public_id}/`)
}