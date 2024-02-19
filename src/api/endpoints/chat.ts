import { Chat_ } from "@app/types/ChatType"
import { BaseHTTPURL } from "@app/config"
import { axiosWithConnectionRetry } from "@app/config"

export const createChat = (chat: Chat_) => {
    return axiosWithConnectionRetry.post(BaseHTTPURL + "chat/", {
        public_id: chat.public_id,
        first_user: chat.first_user.public_id,
        second_user: chat.second_user.public_id
    })
}