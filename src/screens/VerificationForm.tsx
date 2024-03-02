import React, { useState, useRef } from "react";
import { StyleSheet, View, Text, TextInput, Pressable, NativeSyntheticEvent, TextInputKeyPressEventData, StatusBar } from "react-native";
import { errInputStyle, errLabelStyle } from "@app/helpers/errorStyle";
import FormButton from "@app/components/AccountForm/FormButton";
import FormContainer from "@app/components/AccountForm/FormContainer";
import {useAuth} from "@app/context/AuthContext";
import { FlatList } from "react-native-gesture-handler";


const VerificationForm = ({ route, navigation }) => {
    const {username, phoneNumber} = route.params;
    const {onVerify, onResend} = useAuth();
    const [errStyle, setErrStyle] = useState(null);
    const [labelText, setLabelText] = useState("");
    const fields = useRef(Array(6));
    const [otpCode, setOtpCode] = useState([]);

    async function handleForm() {
        const otp = otpCode.join("");
        console.log(otp);
        const response = await onVerify(username, phoneNumber, otp);
        if (response.error) {
            setLabelText(response.msg.detail);
            setErrStyle(errInputStyle);
        }
    }

    const handleChangeText = (text: string, index: number) => {
        otpCode[index] = text;
        setOtpCode(prevState => [...prevState]);
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
        <>
            <StatusBar backgroundColor={'#007767'} />
            <FormContainer>
            <View style={styles.topBlock}>
                <Text style={styles.formTitle}>Підтвердження</Text>
            </View>
            <View style={styles.mainBlock}>
                <Text style={styles.labelText}>Введіть код верифікації:</Text>
                <View style={styles.inputContainer}>
                    <FlatList style={styles.inputBlock} 
                            horizontal={true} 
                            data={fields.current} 
                            contentContainerStyle={{columnGap: 5}}
                            renderItem={({index}) => {
                                return (
                                    <TextInput style={[styles.input, errStyle]}
                                        keyboardType={"decimal-pad"}
                                        ref={input => fields.current[index] = input}
                                        maxLength={1}
                                        onChangeText={text => handleChangeText(text, index)}
                                        onKeyPress={e => handleKeyPress(e, index)}
                                        value={otpCode[index]}
                                    />
                                    )
                                }}
                    />
                    <Text style={[errLabelStyle, {fontSize: 13}]}>{labelText}</Text>
                    <Pressable onPress={() => {
                            onResend(username, phoneNumber)
                    }}>
                        <Text>Надіслати новий код</Text>
                    </Pressable>
                </View>
                <View style={styles.buttonBlock}>
                    <FormButton text={"Повернутися"} onPress={() => {
                            navigation.goBack();
                        }} 
                    />
                </View>
            </View>
        </FormContainer>
        </>
    )
}

const styles = StyleSheet.create({
    formTitle: {
        fontSize: 25,
        color: "white",
    },
    logo: {
        height: 30,
        objectFit: "contain",
    },
    topBlock: {
        flex: 0.3,
        justifyContent: "flex-end"
    },
    mainBlock: {
        flex: 0.7,
        width: "60%",
        marginTop: 30,
    },
    labelText: {
        textAlign: "center",
        fontFamily: "Poppins",
        color: "white",
        marginTop: 30,
    },
    inputContainer: {
        marginTop: 30,
        marginBottom: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    inputBlock: {
        columnGap: 10,
        marginBottom: 12.5,
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
        paddingTop: 2,
        textAlignVertical: "center",
    },
    buttonBlock: {
        flexDirection: "row",
        columnGap: 5,
        justifyContent: "center",
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
    inputHalfBlock: {
        flexDirection: "row",
        columnGap: 5,
    },
});
export default VerificationForm;