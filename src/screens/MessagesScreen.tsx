import React, {useEffect, useRef, useState, memo} from "react"
import {v4 as uuidv4} from "uuid"
import {FlatList, StyleSheet, View} from "react-native";
import {BaseHTTPURL} from "@app/config";
import axios from 'axios';
import {Message} from "@app/types/MessageType";
import ChatKeyboard from "@app/components/chating/ChatKeyboard";
import MessageItem from "../components/chating/MessageItem";
import {useAuth} from "@app/context/AuthContext";
import {useChat} from "@app/context/ChatContext";
import {sortChats, } from "@app/components/helpers/sort";
import {Chat_} from "@app/types/ChatType";
import {OneSignal} from "react-native-onesignal";
import { sendMessage, markAllChatMessagesAsRead } from "@app/api/endpoints/message";
import { createChat } from "@app/api/endpoints/chat";


// @ts-ignore
const MessagesScreen = memo(({route, navigation}) => {
    console.log("Rendering MessagesScreen");
    const messageListRef = useRef(null);
    const footerRef = useRef(null);
    const {chats, setChats} = useChat();
    const {payload}: {payload: {title: string,
                                chat: Chat_,
                                isChatNew: boolean}} = route.params;
    const {authState} = useAuth();
    const messageForChangeState: {message: Message,
                                  setMessageForChange: React.Dispatch<React.SetStateAction<Message>>} = {message: null,
                                                                                             setMessageForChange: null};
    [messageForChangeState.message, messageForChangeState.setMessageForChange] = useState(null);

    const handleLayout = (event, item) => {
        const {y} = event.nativeEvent.layout;
        const footerY = footerRef.current.measureInWindow((x, y) => y);
        if (y > footerY) {
            console.log(`Message ${item.pubic_id} is higher than a footer`);
        }
    }

    const renderMessage = ({index, item}) => {
        if (!payload.chat.messages) return;
        return (
                <View onLayout={e => handleLayout(e, item)}
                        onResponderMove={e => e.nativeEvent.locationY}
                >
                    <MessageItem index={index}
                        messages={payload.chat.messages.results}
                        item={item}
                        messageForChangeState={messageForChangeState}
                    />
                </View>
                )
    }


    const [isRefresh, setIsRefresh] = useState(false);
    const onFlatListRefresh = () => {
        if (!payload.chat.messages.next) return;
        setIsRefresh(true);
        axios.get(payload.chat.messages.next).then((response) => {
            Object.keys(response.data).forEach((key) => {
                if (key === "results") {
                    payload.chat.messages.results.unshift(...response.data.results);
                } else {
                    payload.chat.messages[key] = response.data[key];
                }
            })    
            setChats([...chats].sort(sortChats));
            }
        ).catch(e => console.log(e))
        setIsRefresh(false);
    }

    const createMessage = (text=null, singleFile=null) => {
        const newMessage = {
            created_at: new Date().toString(),
            chat: payload.chat.public_id,
            sender: authState.user,
            is_read: false,
            is_edited: false,
            content: text,
            public_id: uuidv4(),
            file: singleFile,
            hasSendingError: null
        };
        if (payload.isChatNew) {
            createChat(payload.chat)
            .then(() => {
                payload.isChatNew = false;
                setChats([...chats, payload.chat]);
            })
            .catch((e) => {
                console.log(e.response.data)
            })
        }
        sendMessage(newMessage)
            .catch((e) => {
                newMessage.hasSendingError = true;
                payload.chat.messages.results.push(newMessage);
                setChats([...chats.sort(sortChats)]);
            });
    }

    const updateMessage = (message: Message, text=null, singleFile=null) => {
        message.content = text;
        message.file = singleFile;
        setChats([...chats]);
        sendMessage(message, "PUT")
            .then((response) => {
            //     message = response.data;
            //     setChats([...chats]);
            })
            .catch(() => {message.hasSendingError = true})
    }

    const readAllMessages = (chat_id: string): void => {
        markAllChatMessagesAsRead(chat_id);
        const messages = payload.chat.messages.results;
        let hasAnyUnread = false
        for (let message of messages) {
            message.is_read = true;
            hasAnyUnread = true;
        }
        if (hasAnyUnread) {
            payload.chat.messages.unread_messages_count = 0;
            payload.chat.messages.has_unread_messages = false;
            setChats([...chats]);
        }
    }

    useEffect(() => {
        navigation.setOptions({title: payload.title});
        if (!payload.chat || payload.chat.areMessagesFetched) return;
        console.log("Chat id: " + payload.chat.public_id);
        axios.get(BaseHTTPURL + `chat/${payload.chat.public_id}/message/`)
        .then((results) => {
            Object.keys(results.data).forEach((key) => {
                payload.chat.messages[key] = results.data[key];
            })
            console.log(payload.chat.messages.next);
            setChats([...chats.sort(sortChats)]);
        })
        .catch(e => console.log(e));
        messageListRef.current?.scrollToEnd({animating: true});
        const foregroundNotificationListener = (e) => {
            if (!("chat_id" in e.notification.additionalData)) {
                console.log("Notification must include 'chat_id'");
                return
            }
            if (e.notification.additionalData.chat_id == payload.chat.public_id) {
                e.preventDefault();
            }
        };
        OneSignal.Notifications.addEventListener("foregroundWillDisplay", foregroundNotificationListener);

        return () => {
            OneSignal.Notifications.removeEventListener("foregroundWillDisplay", foregroundNotificationListener);
        }
    }, [])

    return (
        <View style={styles.container}>
            <FlatList
                style={styles.messageList}
                data={payload.chat?.messages?.results}
                ref={messageListRef}
                renderItem={renderMessage}
                keyExtractor={item => item.public_id}
                onRefresh={onFlatListRefresh}
                refreshing={isRefresh}
                onEndReached={() => {
                    if (!payload.chat.messages.has_unread_messages) return
                    readAllMessages(payload.chat.public_id);
                }}
            />
            <View style={styles.footer} ref={footerRef}>
                <ChatKeyboard onCreateMessage={createMessage}
                              onChangeMessage={updateMessage}
                              messageForChangeState={messageForChangeState} />
            </View>
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#007767"
    },
    messageList: {
        flex: 1,
        paddingTop: 10,
    },
    footer: {
        backgroundColor: "#FFFFFF",
    },
})
export default MessagesScreen;