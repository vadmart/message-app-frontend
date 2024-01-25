import React, {useEffect, useState, useRef} from "react";
import ChatsScreen from "./ChatsScreen";
import MessagesScreen from "./MessagesScreen"
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {Chat_} from "@app/types/ChatType";
import {ChatProvider} from "@app/context/ChatContext";
import {useAuth} from "@app/context/AuthContext";
import {sortChats} from "@app/components/helpers/sort";
import ScreenNames, {BaseWebsocketURL, BaseHTTPURL} from "@app/config";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import { Message } from "@app/types/MessageType";
import { sendMessage, resendMessagesFromChats } from "@app/api";

const Stack = createNativeStackNavigator();

type WebSocketResponse = {
    chats?: Chat_[],
    chat: Chat_,
    chat_id?: string,
    message?: Message,
    action?: "create" | "update" | "destroy"
}

const MainScreen = () => {
    console.log("Rendering MainScreen");
    const [chats, setChats] = useState<Chat_[]>([]);
    const [waitingForReconnect, setWaitingForReconnect] = useState(true);
    const {authState} = useAuth();
    const wsRef = useRef(null);

    useEffect(() => {
        if (waitingForReconnect) return;
        
        axios.get(BaseHTTPURL + "chat/")
            .then(response => {
                setChats(response.data);
            })
            .catch((e) => {console.log("Network error!")});

        if (!wsRef.current) {
            const client = new WebSocket(BaseWebsocketURL + `?token=${authState.access}`);
            wsRef.current = client;
            client.onopen = () => {
                console.log("WebSocket connection is opened!");
            }
            client.onclose = () => {
                if (wsRef.current) {
                    setWaitingForReconnect(true);
                }
                console.log("Connection is closed!");
            }
            return () => {
                console.log("Reset WebSocket Ref");
                wsRef.current = null;
                client.close();
            }
        }    
    }, [waitingForReconnect])

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            console.log("Adding NetInfo listener");
            if (state.isConnected) {
                if (waitingForReconnect) {
                    setWaitingForReconnect(false);
                }
                resendMessagesFromChats(chats);
            }
        })
        return unsubscribe;
    }, [chats])

    useEffect(() => {
        if (!wsRef.current) return 
        function onMessage (message: MessageEvent) {
            const receivedData: WebSocketResponse = JSON.parse(message.data);
            console.log("OnMessage: ");
            console.log(receivedData);
            let currChat: Chat_ = null;
            if (receivedData.message) {
                for (let i = 0; i < chats.length; ++i) {
                    console.log(`Current public_id: ${chats[i].public_id}, expected public_id: ${receivedData.message.chat}`);
                    if (chats[i].public_id === receivedData.message.chat) {
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
                switch (receivedData.action) {
                    case "create":
                        console.log("Start handling 'create' action")
                        currMessages.push(receivedData.message);
                        setChats([...chats.sort(sortChats)]);
                        break;
                    case "update":
                        for (let i = currMessages.length - 1; i >= 0; --i) {
                            if (currMessages[i].public_id == receivedData.message.public_id) {
                                currMessages[i] = receivedData.message;
                                setChats([...chats]);
                                return;
                            }
                        }
                    case "destroy":
                        for (let i = currMessages.length - 1; i >= 0; --i) {
                            if (currMessages[i].public_id == receivedData.message.public_id) {
                                currMessages.splice(i, 1);
                                setChats([...chats]);
                                return;
                            }
                        }
                }
            }
        }
    console.log("All chats: ");
    console.log(chats);
    wsRef.current.onmessage = onMessage;
    }, [chats, waitingForReconnect])


    return (
        <ChatProvider value={{chats, setChats}}>
            <Stack.Navigator initialRouteName={ScreenNames.CHATS_SCREEN}>
                <Stack.Screen name={ScreenNames.CHATS_SCREEN}
                              component={ChatsScreen}
                              options={{headerShown: false}}
                />
                <Stack.Screen name={ScreenNames.MESSAGES_SCREEN}
                              component={MessagesScreen}
                              />
            </Stack.Navigator>
        </ChatProvider>
    )
}

export default MainScreen;