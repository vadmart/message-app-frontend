import React, {useEffect, useRef, useState, memo} from "react";
import {FlatList, StyleSheet, View} from "react-native";
import {BaseHTTPURL, axiosWithConnectionRetry as axios} from "@app/config";
import {Message} from "@app/types/MessageType";
import ChatKeyboard from "@app/components/chating/ChatKeyboard";
import MessageItem from "../components/chating/MessageItem";
import {useChat} from "@app/context/ChatContext";
import {sortChats, } from "@app/helpers/sort";
import {Chat_} from "@app/types/ChatType";
import {OneSignal} from "react-native-onesignal";
import { readAllMessagesAndSetState } from "@app/helpers/MessageStateAPILayer";


// @ts-ignore
const MessagesScreen = memo(({route, navigation}) => {
    console.log("Rendering MessagesScreen");
    const messageListRef = useRef(null);
    const footerRef = useRef(null);
    const {chats, setChats} = useChat();
    const {payload}: {payload: {title: string,
                                chat: Chat_,
                                isChatNew: boolean}} = route.params;
    const messageForChangeState: {message: Message,
                                  setMessageForChange: React.Dispatch<React.SetStateAction<Message>>} = {message: null,
                                                                                             setMessageForChange: null};
    [messageForChangeState.message, messageForChangeState.setMessageForChange] = useState(null);

    const handleLayout = (event, item) => {
        const {y} = event.nativeEvent.layout;
        const footerY = footerRef.current.measureInWindow((y: number) => y);
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

    const onFlatListRefresh = () => {
        if (!payload.chat.messages.next) return;
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
    }


    useEffect(() => {
        navigation.setOptions({title: payload.title});
        if (!payload.chat || payload.chat.areMessagesFetched) return;
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
                refreshing={false}
                onRefresh={onFlatListRefresh}
                onEndReached={() => {
                    if (!payload.chat.messages.has_unread_messages) return
                    readAllMessagesAndSetState({chats, setChats}, payload);
                }}
            />
            <View style={styles.footer} ref={footerRef}>
                <ChatKeyboard messageForChangeState={messageForChangeState} payload={payload} />
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