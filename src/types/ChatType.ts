import {Message} from "@app/types/MessageType";
import {User} from "@app/types/UserType";

export type Chat_ = {
    first_user: User,
    second_user: User,
    messages: {
        results: Message[],
        next?: string,
        previous?: string,
        unread_messages_count?: number,
        has_unread_messages?: boolean;
    },
    public_id: string,
    areMessagesFetched?: boolean,
    isChatDeleted?: boolean
}

export type ChatsStateType = {
    chats: Chat_[],
    setChats: React.Dispatch<React.SetStateAction<Chat_[]>>
}

export const isAChat = (obj: any): obj is Chat_ => {
    return "created_at" in obj &&
           "first_user" in obj &&
           "second_user" in  obj &&
           "messages" in obj &&
           "public_id" in obj &&
           "unread_messages_count" in obj
}

export const isAChatArray = (obj: any): obj is Chat_[] => {
    for (let chat of obj) {
        if (!isAChat(chat)) return false
    }
    return true
}