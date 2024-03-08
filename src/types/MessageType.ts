import {User} from "@app/types/UserType";
import { DocumentPickerResponse } from "react-native-document-picker";

export interface MessageInfo {
    public_id?: string,
    chat: string,
    sender: User,
    created_at: string,
    is_read: boolean,
    is_edited: boolean,
    hasSendingError?: boolean
}
export type Message = MessageInfo & (
    {content: string, file: null} | 
    {content: null, file: string | DocumentPickerResponse} | 
    {content: string, file: string| DocumentPickerResponse}
)

export const isAMessage = (obj: any): obj is Message => {
    return "public_id" in obj &&
           "chat" in obj &&
           "sender" in obj &&
           "created_at" in obj &&
           "is_edited" in obj &&
           "is_read" in obj &&
           ("content" in obj || "file" in obj)
}

export const isAMessageArray = (obj: any): obj is Message[] => {
    for (let message of obj) {
        if (!isAMessage(message)) return false
    }
    return true
}
