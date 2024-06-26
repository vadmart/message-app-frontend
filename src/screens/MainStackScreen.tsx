import React, {useEffect, useState, useRef} from "react";
import ChatsScreen from "./ChatsScreen";
import PrivateChatScreen from "./PrivateChatScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {Chat_} from "@app/types/ChatType";
import {ChatProvider} from "@app/context/ChatsContext";
import {useAuth} from "@app/context/AuthContext";
import {sortChats} from "@app/utils/sort";
import {BaseWebsocketURL, BaseHTTPURL, ScreenNames} from "@app/config";
import { useConnect } from "@app/context/ConnectionContext";
import { modAxios as axios } from "@app/config";
import { Message } from "@app/types/MessageType";
import { useWSChannelName, WSChannelNameProvider } from "@app/context/WebSocketChannelName";

const Stack = createNativeStackNavigator();


type WebSocketResponse = {
    channel_name?: string,
    chat?: Chat_,
    chat_id?: string,
    message?: Message,
    action: "create" | "update" | "destroy" | "mark_messages_as_read"
}


const MainStackScreen = () => {
    console.log("Rendering MainScreen");
    const {connected} = useConnect();
    const [chats, setChats] = useState<Chat_[]>([]);
    const {authState} = useAuth();
    const wsRef = useRef<WebSocket>(null);
    const wsChannelNameRef = useRef<string>(null);

    useEffect(() => {
        if (!connected) return;
        
        axios.get(BaseHTTPURL + "chat/")
            .then(response => {
                setChats(response.data);
            })
            .catch((e) => {console.log(e)});

        wsRef.current = new WebSocket(BaseWebsocketURL + `?token=${authState.access}`);
        wsRef.current.onopen = () => {
            console.log("WebSocket connection is opened!");

        }
        wsRef.current.onclose = () => {
            console.log("WebSocket connection is closed!");
        }
        return () => {
            console.log("Reset WebSocket Ref");
            wsRef.current.close();
            wsRef.current = null;
            wsChannelNameRef.current = null;
        }

    }, [connected])

    useEffect(() => {
        if (!wsRef.current) return

        const handleWSDataWithMessage = (data: WebSocketResponse): void => {
            let currChat: Chat_ = null;
            for (let i = 0; i < chats.length; ++i) {
                console.log(`Current public_id: ${chats[i].public_id}, expected public_id: ${data.message.chat}`);
                if (chats[i].public_id === data.message.chat) {
                    currChat = chats[i];
                    break;
                }
            }
            console.log(`OnMessage: CurrentChat: ${currChat}`);
            if (currChat === null) {
                console.log("OnMessage: Haven't found any suitable chat");
                return
            }
            const currMessages = currChat.messages.results;
            switch (data.action) {
                case "create":
                    console.log("Start handling 'create' action")
                    currMessages.push(data.message);
                    if (authState.user.public_id != data.message.sender.public_id) {
                        currChat.messages.unread_messages_count += 1;
                        currChat.messages.has_unread_messages = true;
                    }
                    setChats([...chats].sort(sortChats));
                    // storage.set("chat", JSON.stringify(chats));
                    break;
                case "update":
                    for (let i = currMessages.length - 1; i >= 0; --i) {
                        if (currMessages[i].public_id == data.message.public_id) {
                            currMessages[i] = data.message;
                            setChats([...chats]);
                            // storage.set("chat", JSON.stringify(chats));
                            return;
                        }
                    }
                    break;
                case "destroy":
                    for (let i = currMessages.length - 1; i >= 0; --i) {
                        if (currMessages[i].public_id == data.message.public_id) {
                            if (authState.user.public_id !== data.message.sender.public_id && currMessages[i].is_read === false) {
                                currChat.messages.unread_messages_count -= 1;
                                if (currChat.messages.unread_messages_count == 0) {
                                    currChat.messages.has_unread_messages = false;
                                }
                            }
                            currMessages.splice(i, 1);
                            currChat.messages.unread_messages_count -= 1;
                            setChats([...chats]);
                            // storage.set("chat", JSON.stringify(chats));
                            return;
                        }
                    }
                    break;
            }
        }
        const handleWSDataWithChat = (data: WebSocketResponse) => {
            switch (data.action) {
                case "create":
                    setChats(prevState => [...prevState, data.chat]);
                    return
                    // storage.set("chat", JSON.stringify(chats));
                case "destroy":
                    for (let i = chats.length - 1; i >= 0; i--) {
                        if (chats[i].public_id == data.chat.public_id) {
                            // mark chat as deleted, because navigationPayload stores link on this object even after deleting the latter from 'chats' array
                            chats[i].isChatDeleted = true;
                            chats.splice(i, 1);
                            setChats([...chats].sort(sortChats));
                            // storage.set("chat", JSON.stringify(chats));
                            return
                        }
                    }
                    break
                case "mark_messages_as_read":
                    for (let i = chats.length - 1; i >= 0; i--) {
                        if (chats[i].public_id == data.chat_id) {
                            chats[i].messages.unread_messages_count = 0;
                            chats[i].messages.has_unread_messages = false;
                            setChats(prevState => [...prevState]);
                            return
                        }
                    }
                    break
            }
        }

        wsRef.current.onmessage = (message: MessageEvent) => {
            const receivedData: WebSocketResponse = JSON.parse(message.data);
            console.log("WebSocket Received Data: ");
            console.log(receivedData);
            if (receivedData.message) {
                handleWSDataWithMessage(receivedData);
            } else if (receivedData.chat || receivedData.chat_id) {
                handleWSDataWithChat(receivedData);
            } else if (receivedData.channel_name) {
                wsChannelNameRef.current = receivedData.channel_name;
            }
        }

        console.log("All chats: ");
        console.log(chats);
    }, [chats, connected])


    return (
        <ChatProvider value={{chats, setChats}}>
            <WSChannelNameProvider value={wsChannelNameRef.current}>
                <Stack.Navigator initialRouteName={ScreenNames.CHATS_SCREEN}>
                    <Stack.Screen name={ScreenNames.CHATS_SCREEN}
                                component={ChatsScreen}
                                options={{headerShown: false}}
                    />
                    <Stack.Screen name={ScreenNames.MESSAGES_SCREEN}
                                component={PrivateChatScreen}
                                options={{
                                    headerTitleAlign: "center",
                                    headerShadowVisible: false,
                                }}
                    />
                    </Stack.Navigator>
            </WSChannelNameProvider>
        </ChatProvider>
    )
}

export default MainStackScreen;