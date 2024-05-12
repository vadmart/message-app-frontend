import React from "react";
import ReactNativeBlobUtil, {ReactNativeBlobUtilConfig} from "react-native-blob-util"
import {Alert, Image, PermissionsAndroid, Platform, Pressable, StyleSheet, Text, View} from "react-native"
import {Message} from "@app/types/MessageType";
import {toReadableDate, toReadableTime} from "@app/utils/chats";
import Avatar from "@app/components/chating/Avatar";
import {getFileExtension, getFileName} from "@app/utils/file";
import {useAuth} from "@app/context/AuthContext";
import {useChat} from "@app/context/ChatsContext";
import Swipeable from "react-native-gesture-handler/Swipeable";
import {ChangeMessageButton, DeleteMessageButton} from "@app/components/chating/Button";
import { deleteMessage } from "@app/api/endpoints/message";
import { useWSChannelName } from "@app/context/WebSocketChannelName";

const MessageItem = ({index, messages, item, messageForChangeState}:
                     { index: number,
                        messages: Message[],
                        item: Message,
                        messageForChangeState: {message: Message, setMessageForChange: React.Dispatch<React.SetStateAction<Message>>} }): React.JSX.Element => {
    const {authState} = useAuth();
    const {chats, setChats} = useChat();
    const wsChannelName = useWSChannelName();

    const downloadFile = () => {
        const date = new Date();
        const {config, fs} = ReactNativeBlobUtil;
        const RootDir = fs.dirs.SDCardDir;
        const path =
            RootDir + `/file_${Math.floor(date.getTime() + date.getSeconds() / 2)}.${getFileExtension(item.file)}`;
        console.log(ReactNativeBlobUtil.wrap(path));
        let options: ReactNativeBlobUtilConfig = {
            addAndroidDownloads: {
                description: "Downloading a file...",
                path: path,
                notification: true,
                useDownloadManager: true
            }
        }
        config(options)
            .fetch("GET", item.file)
            .then(res => {
                // console.log(res);
                alert('File Downloaded Successfully.');
            })
    }

    const checkPermission = async function () {
        if (Platform.OS === 'ios' || Number(Platform.Version) >= 33) {
            downloadFile();
        } else {
            try {
                const granted = await PermissionsAndroid
                    .request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                        {
                            title: "Необхідний доступ до зовнішнього сховища",
                            message: "Додатку необхідний доступ до зовнішнього сховища для збереження даних",
                            buttonPositive: "OK"
                        });
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("Storage permission granted");
                    downloadFile();
                } else {
                    console.log(typeof granted);
                    Alert.alert('Error', 'Storage Permission Not Granted')
                }
            } catch (e) {
                console.log("++++" + e);
            }
        }
    }

    const onRenderRightActions = (progress, dragX) => {
            return (
                <View style={{flexDirection: "row", columnGap: 5}}>
                    <DeleteMessageButton onPress={() => {
                        messages.splice(index, 1);
                        deleteMessage({...item, exclude_ws_channel: wsChannelName});
                        setChats([...chats]);
                    }}/>
                    <ChangeMessageButton onPress={() => {
                        messageForChangeState.setMessageForChange(item);
                    }}/>
                </View>
                );
     };

    const currentDateTime = new Date(item.created_at);
    const previousDateTime = (index > 0) ? new Date(messages[index - 1].created_at) : new Date(-100);
    const nextDateTime = (index < messages.length - 1) ? new Date(messages[index + 1].created_at) : new Date(-100);
    const nextSender = (index < messages.length - 1) && messages[index + 1].sender;
    return (
        <View>
            {(currentDateTime.getDate() !== previousDateTime.getDate() ||
                    currentDateTime.getMonth() !== previousDateTime.getMonth()) &&
                <View style={styles.dateBlock}>
                    <View style={styles.date}>
                        <Text style={styles.dateText}>{toReadableDate(currentDateTime)}</Text>
                    </View>
                </View>}
            <View
                style={[styles.messageItemBlock, (authState.user.public_id == item.sender.public_id && {flexDirection: "row-reverse"})]}>
                <View style={styles.avatarBlock}>
                    {((currentDateTime.getDate() !== nextDateTime.getDate() ||
                            currentDateTime.getMonth() !== nextDateTime.getMonth())
                        || item.sender.public_id !== nextSender.public_id) ?
                        <Avatar user={item.sender}/> : null}
                </View>
                {(authState.user.public_id == item.sender.public_id) ? 
                <Swipeable renderRightActions={onRenderRightActions} renderLeftActions={() => null} containerStyle={{flex: 0.85}}>
                    <View style={[styles.messageContentBlock, {alignItems: "flex-end"}]}>
                        <View style={[styles.contentTimeBlock, (item == messageForChangeState.message && {backgroundColor: "#4477FF"})]}>
                            {(item.file) &&
                                <View style={styles.fileBlock}>
                                    <Pressable style={styles.downloadButton} onPress={() => checkPermission()}>
                                        <Image source={require("@img/chat-icons/download.png")}
                                            style={styles.downloadButtonIcon}
                                            resizeMethod={"resize"}/>
                                    </Pressable>
                                    <Text style={styles.fileName}>{getFileName(item.file)}</Text>
                                </View>}
                            {(item.content) && <Text style={styles.content}>{item.content}</Text>}
                            <Text style={styles.time}>{toReadableTime(currentDateTime)}</Text>
                        </View>
                    </View>
                </Swipeable> 
                :
                <View style={[styles.messageContentBlock]}>
                    <View style={[styles.contentTimeBlock]}>
                        {(item.file) &&
                            <View style={styles.fileBlock}>
                                <Pressable style={styles.downloadButton} onPress={() => checkPermission()}>
                                    <Image source={require("@img/chat-icons/download.png")}
                                        style={styles.downloadButtonIcon}
                                        resizeMethod={"resize"}/>
                                </Pressable>
                                <Text style={styles.fileName}>{getFileName(item.file)}</Text>
                            </View>}
                        {(item.content) && <Text style={styles.content}>{item.content}</Text>}
                        <Text style={styles.time}>{toReadableTime(currentDateTime)}</Text>
                    </View>
                </View>
                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    messageItemBlock: {
        marginBottom: 20,
        flexDirection: "row",
        columnGap: 5
    },
    avatarBlock: {
        flex: 0.15,
        justifyContent: "flex-end",
        alignItems: "center"
    },
    messageContentBlock: {
        flex: 0.85,
        alignItems: "flex-start"
    },
    contentTimeBlock: {
        borderRadius: 10,
        backgroundColor: "#E1E1E1",
        padding: 10,
        maxWidth: "90%"
    },
    fileBlock: {
        flexDirection: "row",
        alignItems: "center",
        width: "90%"
    },
    fileName: {
        paddingLeft: 10,
    },
    content: {
        fontSize: 16,
        // color: "grey"
    },
    time: {
        color: "#777777",
        alignSelf: "flex-end"
    },
    dateBlock: {
        alignItems: "center",
    },
    date: {
        marginBottom: 10
    },
    dateText: {
        fontSize: 18,
        color: "#fff"
    },
    downloadButton: {
        height: 30,
        backgroundColor: "black",
        padding: 5,
        borderRadius: 20
    },
    downloadButtonIcon: {
        height: "85%",
        aspectRatio: 1
    },
});

export default MessageItem