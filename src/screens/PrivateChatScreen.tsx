import React, {useEffect, useRef, useState, memo} from "react";
import {StyleSheet, View, StatusBar, Text, FlatList, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { KeyboardGestureArea, useKeyboardHandler, KeyboardAvoidingView, KeyboardAwareScrollView } from "react-native-keyboard-controller";
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
import { readAllMessagesAndSetState } from "@app/utils/ChatsStateAPILayer";
import { RefreshControl } from "react-native-gesture-handler";


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
            <FlatList
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
        paddingBottom: 10
    }
})
export default PrivateChatScreen;
