import {v4 as uuidv4} from "uuid";
import { User } from "@app/types/UserType";
import { Message } from "@app/types/MessageType";
import { createMessage, markAllChatMessagesAsRead } from "@app/api/endpoints/message";
import { createChat, destroyChat } from "@app/api/endpoints/chat";
import { Chat_, ChatsStateType } from "@app/types/ChatType";

export const updateMessageAndSetState = async (chatsState: ChatsStateType,
                              message: Message, 
                              changedText=null, 
                              changedFile=null) => {
    message.content = changedText;
    message.file = changedFile;
    message.is_edited = true;
    chatsState.setChats([...chatsState.chats]);
    try {
        await createMessage(message, "PUT");
    } catch {
        message.hasSendingError = true;
    }
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
                                                payload, 
                                                sender: User, 
                                                text=null, 
                                                file=null) => {
    const newMessage = {
        created_at: new Date().toString(),
        chat: payload.chat.public_id,
        sender: sender,
        is_read: false,
        is_edited: false,
        content: text,
        public_id: uuidv4(),
        file: file,
        hasSendingError: null
    };
    payload.chat.messages.results.push(newMessage);
    if (payload.isChatNew) {
        payload.isChatNew = false;
        chatsState.setChats(prevState => [...prevState, payload.chat]);
        try {
            const response = await createChat(payload.chat);
            Object.keys(response.data).forEach(key => {
                payload.chat[key] = response.data[key];
            })
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
            const response = await createMessage(newMessage);
            Object.keys(response.data).forEach(key => {
                newMessage[key] = response.data[key]
            });
            chatsState.setChats(prevState => [...prevState]);
        } catch (e) {
            if (e.response) {
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