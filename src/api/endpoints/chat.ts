import { BaseHTTPURL } from "@app/config"
import { axiosWithConnectionRetry } from "@app/config"
import { ChatRequestPayload } from "@app/types/RequestPayloadType"

export const createChat = async (chat: ChatRequestPayload) => {
    return axiosWithConnectionRetry.post(BaseHTTPURL + "chat/", {
        public_id: chat.public_id,
        second_user: chat.second_user.public_id,
        messages: {results: chat.messages.results},
        exclude_ws_channel: chat.exclude_ws_channel
    })
}

export const destroyChat = async (chat: ChatRequestPayload) => {
    return axiosWithConnectionRetry.delete(BaseHTTPURL + `chat/${chat.public_id}/`)
}