import React, {useEffect, useRef, useState, memo} from "react";
import {FlatList, StyleSheet, View, Text} from "react-native";
import {BaseHTTPURL, axiosWithConnectionRetry as axios} from "@app/config";
import {Message} from "@app/types/MessageType";
import ChatKeyboard from "@app/components/chating/ChatKeyboard";
import MessageItem from "../components/chating/MessageItem";
import {useChat} from "@app/context/ChatsContext";
import {sortChats, } from "@app/helpers/sort";
import {Chat_} from "@app/types/ChatType";
import {OneSignal} from "react-native-onesignal";
import { readAllMessagesAndSetState } from "@app/helpers/ChatsStateAPILayer";
import {useNavigation} from "@react-navigation/native"
import Avatar from "@app/components/chating/Avatar";
import { User } from "@app/types/UserType";


// @ts-ignore
const PrivateChatScreen = memo(({route}) => {
    console.log("Rendering MessagesScreen");
    const messageListRef = useRef(null);
    const footerRef = useRef(null);
    const {chats, setChats} = useChat();
    const navigation = useNavigation();
    const {payload}: {payload: {companion: User,
                                chat: Chat_,
                                isChatNew: boolean}} = route.params;
    console.log(payload);
    const messageForChangeState: {message: Message,
                                  setMessageForChange: React.Dispatch<React.SetStateAction<Message>>} = {message: null,
                                                                                             setMessageForChange: null};
    [messageForChangeState.message, messageForChangeState.setMessageForChange] = useState(null);


    const renderMessage = ({index, item}) => {
        if (!payload.chat.messages) return;
        return (
                <View onResponderMove={e => e.nativeEvent.locationY}
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
        async function _setupPrivateChat() {
            navigation.setOptions({
                                   title: payload.companion.username,
                                });
            if (!payload.chat.areMessagesFetched) return;
            try {
                const response = await axios.get(BaseHTTPURL + `chat/${payload.chat.public_id}/message/`);
                Object.keys(response.data).forEach((key) => {
                    payload.chat.messages[key] = response.data[key];
                })
                console.log(payload.chat.messages.next);
                setChats([...chats].sort(sortChats));
                messageListRef.current?.scrollToEnd({animating: true});
            }
            catch (e) {
                console.log(e)
            }  
        }
        _setupPrivateChat();
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
                    if (payload.chat.messages.has_unread_messages) {
                        readAllMessagesAndSetState({chats, setChats}, payload);
                    }
                }}
            />
            <View style={styles.chatKeyboardContainer}>
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
        paddingTop: 10,
        backgroundColor: "#fff",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        // overflow: "hidden"
    },
    chatKeyboardContainer: {
        backgroundColor: "white", 
        paddingVertical: 20, 
        alignItems: "center"
    }
})
export default PrivateChatScreen;