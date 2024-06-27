import { BaseHTTPURL } from "@app/config"
import { modAxios } from "@app/config"
import { ChatRequestPayload } from "@app/types/RequestPayloadType"

function createFormData(object: Object, form?: FormData, namespace?: string): FormData {
    const formData = form || new FormData();
    for (let property in object) {
        if (!object.hasOwnProperty(property) || !object[property]) {
            continue;
        }
        const formKey = namespace ? `${namespace}[${property}]` : property;
        if (object[property] instanceof Date) {
            formData.append(formKey, object[property].toISOString());
        } else {
            formData.append(formKey, object[property]);
        }
    }
    return formData;
}

export const createChat = async (chat: ChatRequestPayload) => {
    const requestData = {
        public_id: chat.public_id,
        second_user: chat.second_user.public_id,
        exclude_ws_channel: chat.exclude_ws_channel
    };
    return modAxios.post(BaseHTTPURL + "chat/", createFormData(requestData), {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}

export const destroyChat = async (chat: ChatRequestPayload) => {
    return modAxios.delete(BaseHTTPURL + `chat/${chat.public_id}/`)
}