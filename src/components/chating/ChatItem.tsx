import {Pressable, StyleSheet, Text, View} from "react-native";
import {toReadableDateTime} from "@app/helpers/chats";
import {useAuth} from "@app/context/AuthContext";
import React from "react";
import Avatar from "@app/components/chating/Avatar";
import {Chat_} from "@app/types/ChatType";
import { Message } from "@app/types/MessageType";
import {showMessageContent} from "@app/helpers/chats";
import ScreenNames from "@app/config";
import { User } from "@app/types/UserType";


const countUnreadMessages = (currUser: User, messages: Message[]): number => {
    let count = 0;
    for (let message of messages) {
        if (currUser.username !== message.sender.username && !message.is_read) {
            count += 1;
        }
    }
    return count;
}


const ChatItem = ({item, navigation}: {item: Chat_, navigation: any}) => {
    const user = useAuth().authState.user;
    const companion = (item.first_user.username == user.username) ? item.second_user : item.first_user;
    

    return (
        <Pressable style={styles.message} onPress={(e) => {
            console.log("Navigate to messages' screen, UUID: " + item.public_id);
            navigation.navigate(ScreenNames.MESSAGES_SCREEN, {payload: {chat: item, companion, isChatNew: false}});
        }
        }>
            <View style={styles.avatarBlock}>
                <Avatar user={companion} />
            </View>
            <View style={styles.senderTextBlock}>
                <Text
                    style={styles.messageSender}>{companion.username}</Text>
                <Text style={styles.messageText}>{(item.messages?.results.length > 0) ?
                    showMessageContent(item.messages.results[item.messages.results.length - 1]) : ""}</Text>
            </View>
            {(item.messages.unread_messages_count && item.messages.unread_messages_count > 0) ?
                                                <View style={styles.unreadCounter}>
                                                    <Text>{(item.messages.unread_messages_count >= 1000) ? "999+" : item.messages.unread_messages_count}</Text>
                                                </View> : null}
            <View style={styles.dateTimeBlock}>
                <Text style={styles.messageDateTime}>{(item.messages?.results.length > 0) ?
                    toReadableDateTime(new Date(item.messages.results[item.messages.results.length - 1].created_at)) : ""}</Text>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    message: {
        backgroundColor: "white",
        borderColor: "black",
        flexDirection: "row",
        paddingLeft: 5,
        paddingVertical: 10,
        justifyContent: "space-between"
    },
    avatarBlock: {
        justifyContent: "center",
        paddingLeft: 5
    },
    senderTextBlock: {
        flex: 0.65
    },
    messageSender: {
        fontSize: 20,
        fontWeight: "bold"
    },
    messageText: {
        fontSize: 20,
    },
    unreadCounter: {
        backgroundColor: "orange",
        borderRadius: 50,
        width: 35,
        aspectRatio: 1,
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: "bold"
    },
    dateTimeBlock: {
        flex: 0.25,
        justifyContent: "center",
        alignItems: "center",
    },
    messageDateTime: {
        textAlign: "center"
    },
    messageData: {
        display: "none"
    },
});
export default ChatItem;