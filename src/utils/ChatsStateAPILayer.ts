import { createMessage, markAllChatMessagesAsRead } from "@app/api/endpoints/message";
import { createChat, destroyChat } from "@app/api/endpoints/chat";
import { Chat_, ChatsStateType } from "@app/types/ChatType";
import { MessageRequestPayload, ChatRequestPayload } from "@app/types/RequestPayloadType";
import { Message } from "@app/types/MessageType";

export const updateMessageAndSetState = async (chatsState: ChatsStateType,
                              message: MessageRequestPayload,
                              exclude_ws_channel: string = null) => {
    chatsState.setChats(prevState => [...prevState]);
    return await createMessage(message, "PUT");
}

export const readAllMessagesAndSetState = (chatsState: ChatsStateType,
                                payload,
                                exclude_ws_channel=""): void => {
    markAllChatMessagesAsRead(payload.chat.public_id, exclude_ws_channel);
    const messages = payload.chat.messages.results;
    let hasAnyUnread = false
    for (let message of messages) {
        message.is_read = true;
        hasAnyUnread = true;
    }
    if (hasAnyUnread) {
        payload.chat.messages.unread_messages_count = 0;
        payload.chat.messages.has_unread_messages = false;
        chatsState.setChats([...chatsState.chats]);
    }
}


export const createMessageAndSetState = async (chatsState: ChatsStateType,
                                                message: Message,
                                                navigationPayload: any,
                                                exclude_ws_channel: string = null) => {
    navigationPayload.chat.messages.results.push(message);
    try {
        if (navigationPayload.isChatNew) {
            navigationPayload.isChatNew = false;
            chatsState.setChats(prevState => [...prevState, navigationPayload.chat]);
            const response = await createChat({...navigationPayload.chat, exclude_ws_channel});
            for (let key in response.data) {
                if (key !== "messages") {
                    navigationPayload.chat[key] = response.data[key];
                }
            }
        } 
        chatsState.setChats(prevState => [...prevState]);
        const response = await createMessage({...message, exclude_ws_channel}, "POST");
        for (let key in response.data) {
            message[key] = response.data[key]
        }
        chatsState.setChats(prevState => [...prevState]);
    }
    catch(e) {
        if (!!e.response) {
            console.warn(e.response.data)
        } else {
            console.warn(e)
        }
    }
}

export const destroyChatAndSetState = async (chatsState: ChatsStateType,
                                       currChat: ChatRequestPayload,
                                       exclude_ws_channel: string = null) => 
        {
            for (let i = 0; i < chatsState.chats.length; i++) {
                if (chatsState.chats[i].public_id === currChat.public_id) {
                    chatsState.chats.splice(i, 1);
                    chatsState.setChats(prevValues => [...prevValues])
                    break
                }
            }
            await destroyChat({...currChat, exclude_ws_channel});
        }