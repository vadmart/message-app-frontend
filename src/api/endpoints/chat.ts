import { Chat_ } from "@app/types/ChatType"
import { BaseHTTPURL } from "@app/config"
import { axiosWithConnectionRetry } from "@app/config"

export const createChat = async (chat: Chat_) => {
    return axiosWithConnectionRetry.post(BaseHTTPURL + "chat/", {
        public_id: chat.public_id,
        second_user: chat.second_user.public_id,
        messages: {results: chat.messages.results}
    })
}

export const destroyChat = async (chat: Chat_) => {
    return axiosWithConnectionRetry.delete(BaseHTTPURL + `chat/${chat.public_id}/`)
}