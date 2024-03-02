import React, {useRef, useState} from "react"
import {StyleSheet, TextInput, View, Pressable, Image, Text, GestureResponderEvent, ImageSourcePropType, StyleProp, PressableProps, ViewStyle} from "react-native"
import DocumentPicker, {DocumentPickerResponse} from "react-native-document-picker"
import {Message} from "@app/types/MessageType";
import { createMessageAndSetState, updateMessageAndSetState } from "@app/helpers/ChatsStateAPILayer";
import { useChat } from "@app/context/ChatsContext";
import { useAuth } from "@app/context/AuthContext";


const ChatKeyboardButton = ({onPress=null, disabled=false, source=null, style}: 
                            {onPress?: (e: GestureResponderEvent) => void, 
                            disabled?: boolean, 
                            source?: ImageSourcePropType,
                            style?: StyleProp<ViewStyle>}) => {
    return <Pressable style={style} onPress={onPress} disabled={disabled}>
                <Image style={styles.buttonIcon} source={source} resizeMethod={"resize"} />
            </Pressable>
}


const ChatKeyboard = ({messageForChangeState, payload}:
                          {messageForChangeState: {message: Message,
                                                   setMessageForChange: React.Dispatch<React.SetStateAction<Message>>},
                           payload: any}) => {
    const {chats, setChats} = useChat();
    const [singleFile, setSingleFile] = useState<DocumentPickerResponse>(null);
    const [inputtedData, setInputtedData] = useState("");
    const {authState} = useAuth();
    const inputFieldRef = useRef(null);

    const selectFile = async () => {
        try {
            const res = await DocumentPicker.pickSingle({
                type: [DocumentPicker.types.allFiles]
            });
            console.log(`res -> ${JSON.stringify(res)}`);
            setSingleFile(res);
        } catch (e) {
            setSingleFile(null);
            if (DocumentPicker.isCancel(e)) {
                alert("Cancelled!");
            } else {
                alert("Unknown error: " + JSON.stringify(e));
                throw e
            }
        }
    }
        return (
            <View style={{paddingBottom: 10}}>
                {singleFile && <Text style={styles.fileBlock}>{singleFile.name}</Text>}
                <View style={styles.keyboardBlock}>
                    <TextInput style={styles.keyboard}
                               ref={inputFieldRef}
                               onChangeText={(text) => {setInputtedData(text)}}
                               placeholder={"Type some text..."}
                               defaultValue={messageForChangeState.message?.content}
                    />
                    <View style={styles.optionsBlock}>
                        <ChatKeyboardButton
                                    onPress={async () => {
                                        if (messageForChangeState.message) {
                                            updateMessageAndSetState({chats, 
                                                                     setChats}, 
                                                                     messageForChangeState.message, 
                                                                     inputtedData, 
                                                                     singleFile)
                                            messageForChangeState.setMessageForChange(null);
                                        } else {
                                            createMessageAndSetState({chats, 
                                                                     setChats}, 
                                                                     payload,
                                                                     authState.user,
                                                                     inputtedData,
                                                                     singleFile
                                                                     );
                                        }
                                        inputFieldRef.current.clear();
                                        setInputtedData("");
                                        setSingleFile(null);
                                    }}
                                    disabled={(inputtedData === "" && singleFile === null)}
                                    source={require("@img/chat-icons/send.png")}
                                    style={styles.sendButton}>
                        </ChatKeyboardButton>
                        <ChatKeyboardButton onPress={selectFile} source={require("@img/chat-icons/clip_icon.png")} 
                                            style={styles.selectFileButton} />
                    </View>
                </View>
            </View>
    )
}

const styles = StyleSheet.create({
    keyboard: {
        fontSize: 18,
        flex: 1,
        paddingLeft: 15,
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        marginHorizontal: 10
    },
    optionsBlock: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        columnGap: 5,
    },
    fileBlock: {
        fontSize: 18,
        padding: 10,
        backgroundColor: "#fff"
    },
    keyboardBlock: {
        flexDirection: "row",
        height: 45,
        width: "100%"
    },
    selectFileButton: {
        alignItems: "center", 
        justifyContent: "center",
        borderRadius: 50,
        backgroundColor: "#CC5500",
        height: "100%",
        aspectRatio: 1
    },
    sendButton: {
        alignItems: "center", 
        justifyContent: "center",
        borderRadius: 50,
        backgroundColor: "#FFCC00",
        height: "100%",
        aspectRatio: 1
    },
    buttonIcon: {
        height: "60%",
        aspectRatio: 1
    },
});

export default ChatKeyboard;