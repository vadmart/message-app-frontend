import React, {useState} from "react";
import {Image, Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import axios from "axios";
import {BaseHTTPURL} from "@app/config";
import {User} from "@app/types/UserType";
import ScreenNames from "@app/config";
import {v4 as uuidv4} from "uuid";
import { Chat_ } from "@app/types/ChatType";
import { useAuth } from "@app/context/AuthContext";

const ContactSearcher = ({navigation}) => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState("");
    const {authState} = useAuth();

    const handleSubmit = async () => {
        if (!phoneNumber) {
            setError("This field might not be empty!");
            return
        }
        axios.get(BaseHTTPURL + `user/${encodeURIComponent(phoneNumber)}`)
            .then((response) => {
                const companion: User = response.data;
                axios.get(BaseHTTPURL + `chat/get_chat_by_user/?user__public_id=${companion.public_id}`)
                    .then((resp) => {
                        console.log("Chat was found.");
                        navigation.navigate(ScreenNames.MESSAGES_SCREEN, {payload: {chat: resp.data, title: companion.username, isChatNew: false}});
                    })
                    .catch(() => {
                        console.log("Chat wasn't found, trying to create one...");
                        const chat: Chat_ = {
                            public_id: uuidv4(),
                            first_user: authState.user,
                            second_user: companion,
                            messages: {results: []}
                        };
                        navigation.navigate(ScreenNames.MESSAGES_SCREEN, {payload: {chat, title: companion.username, isChatNew: true}});
                    })
            })
            .catch((err) => setError(err.response.data["detail"]))
}

    return (
        <View style={styles.phoneNumberBlock}>
            <View style={[styles.phoneNumberInputBlock, error && {borderColor: "#BB3333"}]}>
                <TextInput style={styles.phoneNumberInput} keyboardType={"phone-pad"} onChangeText={(text) => {
                    setPhoneNumber(text);
                    if (error) setError("");
                }}/>
                <Pressable style={styles.phoneNumberButton} onPress={handleSubmit}>
                    <Image source={require("@img/chat-icons/submit.png")}
                           style={styles.phoneNumberButtonImage}/>
                </Pressable>
            </View>
            <Text style={styles.phoneNumberError}>{error}</Text>
        </View>
    )

}

const styles = StyleSheet.create({
    phoneNumberBlock: {
        alignSelf: "center",
        width: "80%"
    },
    phoneNumberInputBlock: {
        backgroundColor: "white",
        flexDirection: "row",
        height: 50,
        borderWidth: 1,
        borderRadius: 30,
        paddingLeft: 10,
    },
    phoneNumberInput: {
        fontSize: 20,
        flex: 0.8
    },
    phoneNumberButton: {
        flex: 0.2,
        alignItems: "center"
    },
    phoneNumberButtonImage: {
        height: "100%",
        aspectRatio: 1
    },
    phoneNumberError: {
        color: "#FF0000",
        paddingLeft: 5
    },
})

export default ContactSearcher;