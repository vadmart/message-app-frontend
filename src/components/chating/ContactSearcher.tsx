import React, {useState} from "react";
import {Image, Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import { modAxios } from "@app/config";
import {BaseHTTPURL} from "@app/config";
import {User, isUser} from "@app/types/UserType";
import {ScreenNames} from "@app/config";
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
        modAxios.get(BaseHTTPURL + `user/${encodeURIComponent(phoneNumber)}/`)
            .then((response) => {
                const companion = response?.data;
                if (!isUser(companion)) {
                    console.log("Response data is not a 'User' type");
                    setError("Incorrect response. Try again or change a number!");
                    return
                }
                modAxios.get(BaseHTTPURL + `chat/get_chat_by_user/?user__public_id=${companion.public_id}`)
                    .then((resp) => {
                        console.log("Chat was found.");
                        navigation.navigate(ScreenNames.MESSAGES_SCREEN, {payload: {chat: resp.data, companion, isChatNew: false}});
                    })
                    .catch(() => {
                        console.log("Chat wasn't found, trying to create one...");
                        const chat: Chat_ = {
                            public_id: uuidv4(),
                            first_user: authState.user,
                            second_user: companion,
                            messages: {results: []}
                        };
                        navigation.navigate(ScreenNames.MESSAGES_SCREEN, {payload: {chat, companion, isChatNew: true}});
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
        // alignSelf: "center",
        flex: 0.8 
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
        paddingLeft: 5,
        position: "absolute",
        bottom: -20,
        alignSelf: "center"
    },
})

export default ContactSearcher;