import React, {useEffect, useRef, useState, memo} from "react";
import {StyleSheet, View, StatusBar, Text, FlatList, SectionList } from "react-native";
import { useKeyboardHandler,  } from "react-native-keyboard-controller";
import Animated, {useAnimatedStyle, useSharedValue} from "react-native-reanimated";
import {BaseHTTPURL, modAxios as axios} from "@app/config";
import {Message} from "@app/types/MessageType";
import ChatKeyboard from "@app/components/chating/ChatKeyboard";
import MessageItem from "../components/chating/MessageItem";
import {useChat} from "@app/context/ChatsContext";
import {sortChats, } from "@app/utils/sort";
import {Chat_} from "@app/types/ChatType";
import {OneSignal} from "react-native-onesignal";
import {useNavigation} from "@react-navigation/native"
import { User } from "@app/types/UserType";
import { useWSChannelName } from "@app/context/WebSocketChannelName";


const useGradualAnimation = () => {
    const height = useSharedValue(0);
    useKeyboardHandler(
        {
            onMove(e) {
                "worklet"

                height.value = e.height;
            },
            onEnd(e) {
                "worklet"

                height.value = e.height;
            },
        },
        []
    );

    return {height}
}


// @ts-ignore
const PrivateChatScreen = memo(({route}) => {
    console.log("Rendering MessagesScreen");
    const {chats, setChats} = useChat();
    const navigation = useNavigation();
    const wsChannelName = useWSChannelName();
    const flatListRef = useRef<FlatList>();
    const {height} = useGradualAnimation()
    const fakeView = useAnimatedStyle(
        () => ({
            height: Math.abs(height.value)
        }), 
        [],
    );
    const [refreshing, setRefreshing] = useState(false);
    const {payload: navigationPayload}: {payload: {companion: User,
                                chat: Chat_,
                                isChatNew: boolean}} = route.params;
    const messageForChangeState: {message: Message,
                                  setMessageForChange: React.Dispatch<React.SetStateAction<Message>>} = {message: null,
                                                                                             setMessageForChange: null};
    [messageForChangeState.message, messageForChangeState.setMessageForChange] = useState(null);

    const testData = [
        {
            title: "20 травня",
            data: [{"chat": "ab17643c-0372-4cf4-b6b8-32f060f48d5f", "content": "Zdarova, chips😁", "created_at": "2024-05-20T16:48:44.013895Z", "deleted_for_users": [], "file": null, "is_edited": true, "is_read": true, "public_id": "917d0873-a320-4230-bdbb-e06fb99e090c", "sender": {"avatar": null, "created_at": "2024-04-16T16:48:13.568333Z", "edited_at": null, "email": null, "first_name": null, "last_name": null, "phone_number": "+380661886484", "public_id": "18ec5cf1-645e-42f5-be9b-a3c870354262", "username": "oleg"}}, {"chat": "ab17643c-0372-4cf4-b6b8-32f060f48d5f", "content": "💲", "created_at": "2024-05-20T16:49:07.273974Z", "deleted_for_users": [], "file": null, "is_edited": true, "is_read": true, "public_id": "c56f9ffd-4a70-499d-a220-37038aefc9d2", "sender": {"avatar": null, "created_at": "2024-04-16T16:47:24.421042Z", "edited_at": null, "email": null, "first_name": null, "last_name": null, "phone_number": "+380661786484", "public_id": "401b99b0-0b77-45f8-a76d-7d19dfb216fd", "username": "alec"}}]
        },
        {
            title: "21 травня",
            data: [{"chat": "ab17643c-0372-4cf4-b6b8-32f060f48d5f", "content": "💲", "created_at": "2024-05-21T16:49:07.273974Z", "deleted_for_users": [], "file": null, "is_edited": true, "is_read": true, "public_id": "c56f9ffd-4a70-499d-a220-37038aefc9d2", "sender": {"avatar": null, "created_at": "2024-05-21T16:47:24.421042Z", "edited_at": null, "email": null, "first_name": null, "last_name": null, "phone_number": "+380661786484", "public_id": "401b99b0-0b77-45f8-a76d-7d19dfb216fd", "username": "alec"}}]
        },
        {
            title: "22 травня",
            data: [{"chat": "ab17643c-0372-4cf4-b6b8-32f060f48d5f", "content": "Здарова, парень😁", "created_at": "2024-05-22T16:48:44.013895Z", "deleted_for_users": [], "file": null, "is_edited": true, "is_read": true, "public_id": "917d0873-a320-4230-bdbb-e06fb99e090c", "sender": {"avatar": null, "created_at": "2024-05-22T16:48:13.568333Z", "edited_at": null, "email": null, "first_name": null, "last_name": null, "phone_number": "+380661886484", "public_id": "18ec5cf1-645e-42f5-be9b-a3c870354262", "username": "oleg"}}, {"chat": "ab17643c-0372-4cf4-b6b8-32f060f48d5f", "content": "💲", "created_at": "2024-04-16T16:49:07.273974Z", "deleted_for_users": [], "file": null, "is_edited": true, "is_read": true, "public_id": "c56f9ffd-4a70-499d-a220-37038aefc9d2", "sender": {"avatar": null, "created_at": "2024-04-16T16:47:24.421042Z", "edited_at": null, "email": null, "first_name": null, "last_name": null, "phone_number": "+380661786484", "public_id": "401b99b0-0b77-45f8-a76d-7d19dfb216fd", "username": "alec"}}]
        }
    ]

    const RenderMessage = ({index, item, messages}: {index: number, item: Message, messages: Message[]}) => {
        if (!navigationPayload.chat.messages) return;
        return (
                <View onResponderMove={e => e.nativeEvent.locationY}
                >
                    <MessageItem index={index}
                        messages={messages}
                        item={item}
                        messageForChangeState={messageForChangeState}
                    />
                </View>
            )
    }

    const onRefresh = async () => {
        if (!navigationPayload.chat.messages.next) return;
        setRefreshing(true)
        try {
            const response = await axios.get(navigationPayload.chat.messages.next);
            Object.keys(response.data).forEach((key) => {
                if (key === "results") {
                    navigationPayload.chat.messages.results.unshift(...response.data.results);
                } else {
                    navigationPayload.chat.messages[key] = response.data[key];
                }
            })    
            setChats([...chats].sort(sortChats));
            }
         catch (e) {
            console.error("Refresh error!");
        } finally {
            setRefreshing(false);
        }
    }

    useEffect(() => {
        async function _setupPrivateChat() {
            navigation.setOptions({
                                   title: navigationPayload.companion.username,
                                });
            if (navigationPayload.chat.areMessagesFetched) return;
            try {
                // TODO: move API request below to a separate module
                const response = await axios.get(BaseHTTPURL + `chat/${navigationPayload.chat.public_id}/message/`);
                for (let key in response.data) {
                    navigationPayload.chat.messages[key] = response.data[key];
                }
                console.log(navigationPayload.chat.messages.next);
                navigationPayload.chat.areMessagesFetched = true;
                setChats([...chats].sort(sortChats));
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
            if (e.notification.additionalData.chat_id == navigationPayload.chat.public_id) {
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
            <StatusBar backgroundColor={"white"} barStyle={"dark-content"} animated={true}/>
            {/* <FlatList
                inverted
                ref={flatListRef}
                data={Array.from(navigationPayload.chat?.messages?.results).reverse()}
                renderItem={({index, item}) => <RenderMessage index={index} messages={Array.from(navigationPayload.chat.messages.results).reverse()} item={item}/>}
                keyExtractor={item => item.public_id}
                refreshing={refreshing}

                onEndReached={async () => {
                    await onRefresh();
                    // if (navigationPayload.chat.messages.has_unread_messages) {
                    //     readAllMessagesAndSetState({chats, setChats}, navigationPayload, wsChannelName);
                    // }
                }}
                contentContainerStyle={styles.messagesList}
            /> */}
            <SectionList
                inverted
                sections={testData}
                renderItem={({index, item}) => <RenderMessage index={index} messages={Array.from(navigationPayload.chat.messages.results).reverse()} item={item}/>}
                keyExtractor={item => item.public_id}
                refreshing={refreshing}

                onEndReached={async () => {
                    await onRefresh();
                    // if (navigationPayload.chat.messages.has_unread_messages) {
                    //     readAllMessagesAndSetState({chats, setChats}, navigationPayload, wsChannelName);
                    // }
                }}
                contentContainerStyle={styles.messagesList}
            />
            {(!navigationPayload.chat.isChatDeleted) ? 
                <ChatKeyboard messageForChangeState={messageForChangeState} 
                            payload={navigationPayload}
                />
                : <View>
                    <Text style={{textAlign: "center", fontStyle: "italic"}}>Ви не можете відправляти повідомлення у цей чат</Text>  
                </View>}
            <Animated.View style={fakeView} />
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#007767",
    },
    messagesList: {
        paddingBottom: 10,
        flex: 1,
        justifyContent: "flex-end"
    }
})
export default PrivateChatScreen;
