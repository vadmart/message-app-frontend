import React, {memo, useEffect, useRef, useState} from "react";
import {FlatList, StyleSheet, View} from "react-native";
import ContactSearcher from "@app/components/chating/ContactSearcher";
import ChatItem from "@app/components/chating/ChatItem";
import {useChat} from "@app/context/ChatContext";
import { BaseHTTPURL, BaseWebsocketURL } from "@app/config";
import { useAuth } from "@app/context/AuthContext";
import {Chat_} from "@app/types/ChatType"
import { Message } from "@app/types/MessageType";
import { sortChats } from "@app/components/helpers/sort";
import NetInfo from "@react-native-community/netinfo";
import { storage } from "@app/components/Storage";
import axios from "axios";

type WebSocketResponse = {
    chats?: Chat_[],
    chat: Chat_,
    chat_id?: string,
    message?: Message,
    action?: "create" | "update" | "destroy"
}

// function reconnectClient(url: string) {
//     let client: WebSocket = null;
//     let messageListeners = [];
//     let stateChangeListeners = [];

//     function on(fn: Function) {
//         messageListeners.push(fn);
//     }

//     function off(fn: Function) {
//         messageListeners = messageListeners.filter(val => val !== fn);
//     }

//     function onStateChange(fn: Function) {
//         stateChangeListeners.push(fn);
//         return () => {
//             stateChangeListeners = stateChangeListeners.filter(val => val !== fn);
//         }
//     }

//     function start() {
//         client = new WebSocket(url);
        
//         client.onopen = () => {
//             stateChangeListeners.forEach(fn => fn(true))
//         }

//         const close = client.close;
    
//         // Close without reconnecting;
//         client.close = () => {
//             close.call(client);
//         }
    
//         client.onmessage = (event) => {
//             messageListeners.forEach(fn => fn(event.data));
//         }
    
//         client.onerror = (e) => console.error(e);
    
//         client.onclose = () => {
//             stateChangeListeners.forEach(fn => fn(false));
//         }
//     }
  
//     start();
  
//     return {
//       on,
//       off,
//       onStateChange,
//       close: () => client.close(),
//       getClient: () => client,
//     };
// }

// @ts-ignore
const ChatsScreen = memo(({navigation}) => {
    console.log("Rendering ChatsScreen");
    const {chats, setChats} = useChat();
    const [isConnected, setIsConnected] = useState(false);
    const [waitingForReconnect, setWaitingForReconnect] = useState(true);
    const {authState} = useAuth();
    const wsRef = useRef(null);
    console.log(authState.access)

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected) {
                setWaitingForReconnect(false);
            }
        })
        return () => {
            unsubscribe();
        }
    }, [])

    useEffect(() => {
        if (waitingForReconnect) return;

        axios.get(BaseHTTPURL + "chat/")
            .then(response => {
                console.log(response.data.results);
                setChats(response.data.results);
            });

        if (!wsRef.current) {
            const client = new WebSocket(BaseWebsocketURL + `?token=${authState.access}`);
            wsRef.current = client;
            client.onopen = () => {
                setIsConnected(true);
                console.log("WebSocket connection is opened!");
            }
            client.onclose = () => {
                if (wsRef.current) {
                    setWaitingForReconnect(true);
                }
                setIsConnected(false);
                console.log("Connection is closed!");
            }
            return () => {
                wsRef.current = null;
                client.close();
            }
        }    
    }, [waitingForReconnect])

    useEffect(() => {
        if (!wsRef.current || !isConnected) return;

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
                const currMessages = currChat.messages;
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
            console.log("All chats: ");
            console.log(chats);
        }
        wsRef.current.onmessage = onMessage;
    }, [chats])


    return (
        <View style={styles.container}>
            <ContactSearcher navigation={navigation}/>
            <FlatList data={chats}
                      renderItem={({item}) => {
                          return (
                              <ChatItem item={item}
                                        navigation={navigation}
                              />
                          )
                      }}
                      keyExtractor={item => item.public_id}
            />
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#007767",
        paddingTop: 10,
        rowGap: 10
    },

})
export default ChatsScreen;