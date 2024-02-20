import React, {createContext, useContext} from "react";
import {ChatsStateType} from "@app/types/ChatType";

const ChatContext = createContext<ChatsStateType>({chats: null, setChats: null});

export const useChat = () => {
    return useContext(ChatContext);
}

export const ChatProvider = ({children, value}) => {
    return (
        <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
    )
}
