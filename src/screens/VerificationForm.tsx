import React, { useState, useRef } from "react";
import { StyleSheet, View, Text, TextInput, Pressable, NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";
import { errInputStyle, errLabelStyle } from "@app/utils/errorStyle";
import FormContainer from "@app/components/AccountForm/FormContainer";
import {useAuth} from "@app/context/AuthContext";
import { FlatList } from "react-native-gesture-handler";


const VerificationForm = ({ route, navigation }) => {
    const {username, phoneNumber} = route.params;
    const {onVerify, onResend} = useAuth();
    const [error, setError] = useState("");
    const fields = useRef(Array(6));
    const [otpCode, setOtpCode] = useState([]);

    async function handleForm() {
        const otp = otpCode.join("");
        console.log(otp);
        const response = await onVerify(username, phoneNumber, otp);
        if (response.error) {
            setError(response.msg.detail);
        }
    }

    const handleChangeText = (text: string, index: number) => {
        otpCode[index] = text;
        setOtpCode(prevState => [...prevState]);
        if (error) {
            setError("");
        }
        if (index < 5 && text !== "") {
            fields.current[index + 1].focus();
        }
        if (index === 5) {
            console.log("Start form handling");
            handleForm();
        }
    }

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === "Backspace" && index > 0) {
            if (otpCode[index] === "") {
                otpCode[index - 1] = "";
                setOtpCode(prevState => [...prevState])
            }
            fields.current[index - 1].focus();
        }
    }

    return (
        <View style={{flex: 1, backgroundColor: "#007767", justifyContent: "center"}}>
            <FormContainer title={"Підтвердження"} bottomButtonText={"Повернутися"}
                                    bottomButtonOnPress={() => {navigation.goBack()}}
                                    contentStyle={{alignItems: "center"}}>
                    <Text style={styles.labelText}>Введіть код верифікації:</Text>
                    <FlatList horizontal={true}
                            data={fields.current} 
                            contentContainerStyle={{columnGap: 5}}
                            renderItem={({index}) => {
                                return (
                                    <TextInput style={[styles.input, error && errInputStyle]}
                                        keyboardType={"decimal-pad"}
                                        ref={input => fields.current[index] = input}
                                        maxLength={1}
                                        onChangeText={text => handleChangeText(text, index)}
                                        onKeyPress={e => handleKeyPress(e, index)}
                                        value={otpCode[index]}
                                    />
                                    )
                                }    
                            }
                            scrollEnabled={false}
                    />
                    <Text style={[errLabelStyle, {fontSize: 13}]}>{error}</Text>
                    <Pressable onPress={() => {
                            onResend(username, phoneNumber)
                    }}>
                        <Text>Надіслати новий код</Text>
                    </Pressable>
            </FormContainer>
        </View>
    )
}

const styles = StyleSheet.create({
    formTitle: {
        fontSize: 25,
        color: "white",
        alignSelf: "center",
    },
    logo: {
        height: 30,
        objectFit: "contain",
    },
    labelText: {
        textAlign: "center",
        fontFamily: "Poppins",
        color: "white",
        marginTop: 30,
    },
    inputContainer: {
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        height: 200
    },
    input: {
        textAlign: "center",
        fontFamily: "Poppins",
        borderColor: "white",
        borderWidth: 2,
        borderRadius: 5,
        color: "white",
        fontSize: 16,
        width: 35,
        aspectRatio: 1,
        textAlignVertical: "center",
    },
    button: {
        backgroundColor: "#001E41",
        borderRadius: 30,
        paddingTop: 15,
        paddingBottom: 15,
        paddingRight: 30,
        paddingLeft: 30,
    },
    buttonText: {
        color: "white",
        fontSize: 14,
        fontFamily: "Poppins",
    },
});
export default VerificationForm;
