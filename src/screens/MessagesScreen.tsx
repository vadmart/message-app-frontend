import React, {useEffect, useRef, useState, memo} from "react"
import {FlatList, StyleSheet, View} from "react-native";
import {BaseHTTPURL} from "@app/config";
import axios from 'axios';
import {Message} from "@app/types/MessageType";
import ChatKeyboard from "@app/components/chating/ChatKeyboard";
import MessageItem from "../components/chating/MessageItem";
import {useAuth} from "@app/context/AuthContext";
import {useChat} from "@app/context/ChatContext";
import {sortChats, sortMessages} from "@app/components/helpers/sort";
import {Chat_} from "@app/types/ChatType";
import {User} from "@app/types/UserType";
import {OneSignal} from "react-native-onesignal";
import { sendMessage, markMessageAsRead, markAllChatMessagesAsRead } from "@app/api/endpoints/message";


// @ts-ignore
const MessagesScreen = memo(({route, navigation}) => {
    console.log("Rendering MessagesScreen");
    const messageListRef = useRef(null);
    const footerRef = useRef(null);
    const {chats, setChats} = useChat();
    const {payload}: {payload: {title: string,
                                chatData?: Chat_,
                                userData?: User,
                                chatIndex?: number}} = route.params;
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
        if (!payload.chatData.messages) return;
        return (
                <View onLayout={e => handleLayout(e, item)}
                        onResponderMove={e => e.nativeEvent.locationY}
                >
                    <MessageItem index={index}
                        messages={payload.chatData.messages.results}
                        item={item}
                        messageForChangeState={messageForChangeState}
                    />
                </View>
                )
    }


    const [isRefresh, setIsRefresh] = useState(false);
    const onFlatListRefresh = () => {
        if (!payload.chatData.messages.next) return;
        setIsRefresh(true);
        axios.get(payload.chatData.messages.next).then((response) => {
            Object.keys(response.data).forEach((key) => {
                if (key === "results") {
                    payload.chatData.messages.results.unshift(...response.data.results);
                } else {
                    payload.chatData.messages[key] = response.data[key];
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
            chat: payload.chatData?.public_id,
            sender: authState.user,
            is_read: false,
            is_edited: false,
            content: text,
            public_id: Math.random().toString(36).slice(2),
            file: singleFile,
            hasSendingError: null
        };
        sendMessage({...newMessage, public_id: null})
            .catch((e) => {
                console.log(e);
                newMessage.hasSendingError = true;
                payload.chatData.messages.results.push(newMessage);
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
        const messages = payload.chatData.messages.results;
        let hasAnyUnread = false
        for (let message of messages) {
            message.is_read = true;
            hasAnyUnread = true;
        }
        if (hasAnyUnread) {
            payload.chatData.messages.unread_messages_count = 0;
            payload.chatData.messages.has_unread_messages = false;
            setChats([...chats]);
        }
    }

    useEffect(() => {
        navigation.setOptions({title: payload.title});
        if (!payload.chatData || payload.chatData.areMessagesFetched) return;
        axios.get(BaseHTTPURL + `chat/${payload.chatData.public_id}/message/`)
        .then((results) => {
            Object.keys(results.data).forEach((key) => {
                payload.chatData.messages[key] = results.data[key];
            })
            console.log(payload.chatData.messages.next);
            setChats([...chats.sort(sortChats)]);
        })
        .catch(e => console.log(e));
        messageListRef.current?.scrollToEnd({animating: true});
        const foregroundNotificationListener = (e) => {
            if (!("chat_id" in e.notification.additionalData)) {
                console.log("Notification must include 'chat_id'");
                return
            }
            if (e.notification.additionalData.chat_id == payload.chatData.public_id) {
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
                data={payload.chatData?.messages?.results}
                ref={messageListRef}
                renderItem={renderMessage}
                keyExtractor={item => item.public_id}
                onRefresh={onFlatListRefresh}
                refreshing={isRefresh}
                onEndReached={() => {
                    if (!payload.chatData.messages.has_unread_messages) return
                    readAllMessages(payload.chatData.public_id);
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