import {v4 as uuidv4} from "uuid";
import { User } from "@app/types/UserType";
import { Message } from "@app/types/MessageType";
import { createMessage, markAllChatMessagesAsRead } from "@app/api/endpoints/message";
import { createChat, destroyChat } from "@app/api/endpoints/chat";
import { Chat_, ChatsStateType } from "@app/types/ChatType";
import { RequestPayload } from "@app/types/RequestPayloadType";

export const updateMessageAndSetState = async (chatsState: ChatsStateType,
                              message: RequestPayload) => {
    chatsState.setChats(prevState => [...prevState]);
    return await createMessage(message, "PUT");
}

export const readAllMessagesAndSetState = (chatsState: ChatsStateType,
                                payload): void => {
    markAllChatMessagesAsRead(payload.chat.public_id);
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
                                                message: RequestPayload,
                                                navigationPayload: any) => {
    navigationPayload.chat.messages.results.push(message);
    if (navigationPayload.isChatNew) {
        navigationPayload.isChatNew = false;
        chatsState.setChats(prevState => [...prevState, navigationPayload.chat]);
        try {
            const response = await createChat(navigationPayload.chat);
            for (let key in response.data) {
                navigationPayload.chat[key] = response.data[key];
            }
            chatsState.setChats(prevState => [...prevState]);
        }
        catch(e) {
            if (e.response) {
                console.error(e.response.data);
            } else {
                console.error(e);
            }
        }
    } else {
        try {
            chatsState.setChats(prevState => [...prevState]);
            const response = await createMessage(message, "POST");
            for (let key in response.data) {
                message[key] = response.data[key]
            }
            chatsState.setChats(prevState => [...prevState]);
        } catch (e) {
            if (!!e.response) {
                console.error(e.response.data);
            } else {
                console.error(e);
            }
        }   
    }
}

export const destroyChatAndSetState = async (chatsState: ChatsStateType,
                                       currChat: Chat_) => 
        {
            for (let i = 0; i < chatsState.chats.length; i++) {
                if (chatsState.chats[i].public_id === currChat.public_id) {
                    chatsState.chats.splice(i, 1);
                    chatsState.setChats(prevValues => [...prevValues])
                    break
                }
            }
            await destroyChat(currChat);
        }