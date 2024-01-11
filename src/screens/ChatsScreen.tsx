import React, {memo, useEffect, useRef} from "react";
import {FlatList, StyleSheet, View} from "react-native";
import ContactSearcher from "@app/components/chating/ContactSearcher";
import ChatItem from "@app/components/chating/ChatItem";
import {useChat} from "@app/context/ChatContext";
import { BaseWebsocketURL } from "@app/config";
import { useAuth } from "@app/context/AuthContext";
import {Chat_} from "@app/types/ChatType"
import { Message } from "@app/types/MessageType";
import { sortChats } from "@app/components/helpers/sort";

type WebSocketResponse = {
    chats?: Chat_[],
    chat: Chat_,
    chat_id?: string,
    message?: Message,
    action?: "create" | "update" | "delete"
}

// @ts-ignore
const ChatsScreen = memo(({navigation}) => {
    console.log("Rendering ChatsScreen");
    const {chats, setChats} = useChat();
    const {authState} = useAuth();
    const ws: {current: WebSocket} = useRef(null);

    function onMessage(e) {
        // console.log(chats);
        console.log("OnMessage: ");
        const receivedData: WebSocketResponse = JSON.parse(e.data);
        console.log(receivedData);
        if (receivedData.chats) {
            setChats(() => [...receivedData.chats]);
        }
        else if (receivedData.message) {
            let currChat: Chat_ = null;
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
            }
        }
        console.log("All chats: ");
        console.log(chats);
    };

    useEffect(() => {
        ws.current = new WebSocket(BaseWebsocketURL + `?token=${authState.access}`);
        return () => {
            ws.current.close();
        }
    }, [])
    

    useEffect(() => {
        ws.current.onmessage = onMessage;
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