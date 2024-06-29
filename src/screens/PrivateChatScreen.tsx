import React, {useEffect, useRef, useState, memo} from "react";
import {StyleSheet, View, StatusBar, Text, Keyboard, KeyboardEvent, FlatList, KeyboardAvoidingView, NativeSyntheticEvent, NativeScrollEvent, Platform } from "react-native";
import {KeyboardAwareScrollView, KeyboardGestureArea, useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
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
import { useKeyboardContext } from "react-native-keyboard-controller";



// @ts-ignore
const PrivateChatScreen = memo(({route}) => {
    console.log("Rendering MessagesScreen");
    const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
    const {chats, setChats} = useChat();
    const navigation = useNavigation();
    const wsChannelName = useWSChannelName();
    const flatListRef = useRef<FlatList>();
    const messagesOffsetRef = useRef<number>();
    // const {setEnabled} = useKeyboardContext();
    const {payload: navigationPayload}: {payload: {companion: User,
                                chat: Chat_,
                                isChatNew: boolean}} = route.params;
    const messageForChangeState: {message: Message,
                                  setMessageForChange: React.Dispatch<React.SetStateAction<Message>>} = {message: null,
                                                                                             setMessageForChange: null};
    [messageForChangeState.message, messageForChangeState.setMessageForChange] = useState(null);

    const MessageBlock = ({index, item}) => {
        if (!navigationPayload.chat.messages) return;
        return (
                <View onResponderMove={e => e.nativeEvent.locationY}
                >
                    <MessageItem index={index}
                        messages={navigationPayload.chat.messages.results}
                        item={item}
                        messageForChangeState={messageForChangeState}
                    />
                </View>
            )
    }

    const onFlatListRefresh = () => {
        if (!navigationPayload.chat.messages.next) return;
        axios.get(navigationPayload.chat.messages.next).then((response) => {
            Object.keys(response.data).forEach((key) => {
                if (key === "results") {
                    navigationPayload.chat.messages.results.unshift(...response.data.results);
                } else {
                    navigationPayload.chat.messages[key] = response.data[key];
                }
            })    
            setChats([...chats].sort(sortChats));
            }
        ).catch(e => console.log(e))
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

        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', onKeyboardDidShow);
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', onKeyboardDidHide);

        OneSignal.Notifications.addEventListener("foregroundWillDisplay", foregroundNotificationListener);

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
            OneSignal.Notifications.removeEventListener("foregroundWillDisplay", foregroundNotificationListener);
        }
    }, [])

    const onKeyboardDidShow = (event: KeyboardEvent) => {
        if (!isAtBottom) {
            flatListRef.current.scrollToOffset({ offset: event.endCoordinates.height, animated: true });
        }
    };

    const onKeyboardDidHide = () => {
        if (!isAtBottom) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const bottomCheck = layoutMeasurement.height + contentOffset.y >= contentSize.height / 1.5; // Adjust as needed
        console.log(`Is at bottom: ${bottomCheck}`);
        setIsAtBottom(bottomCheck);
    };

    return (
        <KeyboardAvoidingView style={styles.container} keyboardVerticalOffset={100} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <StatusBar backgroundColor={"white"} barStyle={"dark-content"} animated={true}/>
            {/* <KeyboardAwareScrollView>
                {navigationPayload.chat?.messages?.results.map((value, index) => (
                    <MessageBlock item={value} index={index}/>
                    )
                )}
            </KeyboardAwareScrollView> */}
            
            <FlatList
                ref={flatListRef}
                data={navigationPayload.chat?.messages?.results}
                renderItem={MessageBlock}
                keyExtractor={item => item.public_id}
                refreshing={false}
                onRefresh={onFlatListRefresh}
                onEndReached={() => {
                    if (navigationPayload.chat.messages.has_unread_messages) {
                        readAllMessagesAndSetState({chats, setChats}, navigationPayload, wsChannelName);
                    }
                }}
                onScroll={handleScroll}
            />
            {(!navigationPayload.chat.isChatDeleted) ? 
                <ChatKeyboard messageForChangeState={messageForChangeState} 
                            payload={navigationPayload} 
                            chatsListRef={flatListRef}
                />
                : <View>
                    <Text style={{textAlign: "center", fontStyle: "italic"}}>Ви не можете відправляти повідомлення у цей чат</Text>  
                </View>}
        </KeyboardAvoidingView>
    )
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#007767",

    }
})
export default PrivateChatScreen;
