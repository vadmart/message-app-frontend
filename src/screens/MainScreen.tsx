import React, {useEffect, useState, memo} from "react";
import ChatsScreen from "./ChatsScreen";
import MessagesScreen from "./MessagesScreen"
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {Chat_, isAChat} from "@app/types/ChatType";
import {ChatProvider} from "@app/context/ChatContext";
import {OneSignal, NotificationWillDisplayEvent} from "react-native-onesignal";
import {isAMessage, Message} from "@app/types/MessageType";
import {useAuth} from "@app/context/AuthContext";
import {sortChats} from "@app/components/helpers/sort";
import ScreenNames, {BaseWebsocketURL} from "@app/config";

const Stack = createNativeStackNavigator();

const MainScreen = () => {
    console.log("Rendering MainScreen");
    const [chats, setChats] = useState<Chat_[]>([]);
    const chatsState = {chats, setChats};

    return (
        <ChatProvider value={chatsState}>
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