import {v4 as uuidv4} from "uuid";
import { User } from "@app/types/UserType";
import { Message } from "@app/types/MessageType";
import { createMessage, markAllChatMessagesAsRead } from "@app/api/endpoints/message";
import { createChat } from "@app/api/endpoints/chat";
import { ChatsStateType } from "@app/types/ChatType";

export const updateMessageAndSetState = (chatsState: ChatsStateType,
                              message: Message, 
                              changedText=null, 
                              changedFile=null) => {
    message.content = changedText;
    message.file = changedFile;
    message.is_edited = true;
    chatsState.setChats([...chatsState.chats]);
    createMessage(message, "PUT")
        .catch(() => {message.hasSendingError = true})
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
    const newMessageInd = payload.chat.messages.results.push(newMessage) - 1;
    try {
        if (payload.isChatNew) {
            console.log("Creating a chat.");
            chatsState.setChats(prevState => [...prevState, payload.chat]);
            payload.chat = (await createChat(payload.chat, newMessage)).data;
            payload.isChatNew = false;
        } else {
            chatsState.setChats(prevState => [...prevState]);
            const response = await createMessage(newMessage);
            payload.chat.messages.results[newMessageInd] = response.data;  
        }
    } catch(e) {
        if (e.response) {
            console.log(e.response.data);
        } else {
            console.log(e);
        }
    }
    
    chatsState.setChats(prevState => [...prevState]);
}