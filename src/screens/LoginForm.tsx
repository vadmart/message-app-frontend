import React, {useState} from "react";
import { StyleSheet, View, TextInput, Text  } from "react-native";
import { errInputStyle, errLabelStyle } from "@app/utils/errorStyle";
import { useAuth } from "@app/context/AuthContext"
import FormNavigationButton from "@app/components/AccountForm/FormRedirectButton";
import FormContainer from "@app/components/AccountForm/FormContainer";
import {ScreenNames} from "@app/config";



const LoginForm = ({ navigation }) => {
    const [username, onChangeUsername] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [phoneNumber, onChangePhoneNumber] = useState("");
    const [phoneNumberError, setPhoneNumberError] = useState("");
    const [validationError, setValidationError] = useState("");
    const {onLogin} = useAuth();


    async function handleLoginSubmit(e) {
        console.log("Start login handling...");
        if (!username) {
            setUsernameError("Поле не може бути порожнім.");
            return
        }
        if (!phoneNumber) {
            setPhoneNumberError("Поле не може бути порожнім.");
            return
        }
        const response = await onLogin(username, "+380" + phoneNumber);
        if (response.error) {
            for (let val of Object.values<string>(response.msg)) {
                setValidationError(val);
            }
        } else {
            navigation.navigate(ScreenNames.VERIFICATION, {username, phoneNumber: "+380" + phoneNumber})
        }
    }

    return (
        <View style={styles.container}>
            <FormContainer title={"Вхід"}
                            bottomButtonText={"Продовжити"}
                            bottomButtonOnPress={handleLoginSubmit}>
                <View style={styles.navigationButtonContainer}>
                    <FormNavigationButton text={"Реєстрація"} onSubmit={() => navigation.navigate(ScreenNames.REGISTRATION)} />
                </View>
                <View style={styles.inputContainer}>
                    <TextInput style={[styles.input, usernameError && errInputStyle]}
                        onChangeText={onChangeUsername}
                        onChange={() => {
                            if (usernameError) {
                                setUsernameError("");
                            }
                            if (validationError) {
                                setValidationError("");
                            }
                        }}
                        placeholder={"Ім'я користувача"}
                        placeholderTextColor={usernameError ? "#FF000025" : "#17171729"}
                        value={username}
                    />
                    <Text style={{color: errInputStyle.color}}>{usernameError}</Text>
                </View>
                <View style={styles.inputContainer}>
                    <View style={[styles.phoneInputBlock, phoneNumberError && errInputStyle]}>
                        <Text style={styles.phoneCode}>+380</Text>
                        <TextInput style={[styles.input, {fontSize: (phoneNumber) ? 18 : 15, paddingLeft: 5, flex: 1}]}
                            keyboardType={"decimal-pad"}
                            onChangeText={onChangePhoneNumber}
                            onChange={() => {
                                if (phoneNumberError) {
                                    setPhoneNumberError("");
                                }
                                if (validationError) {
                                    setValidationError("");
                                }
                            }}
                            placeholder={"Номер телефону"}
                            placeholderTextColor={"#17171729"}
                            value={phoneNumber}
                        />
                    </View>
                    <Text style={{color: errInputStyle.color}}>{phoneNumberError}</Text>
                </View>
                <View style={styles.validationErrBlock}>
                    <Text style={errLabelStyle}>{validationError}</Text>
                </View>
            </FormContainer>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: "#007767", 
        justifyContent: "center"
    },
    navigationButtonContainer: {
        alignItems: "flex-end",
    },
    phoneInputBlock: {
        flexDirection: "row",
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: "center",
    },
    phoneCode: {
        textAlign: "center",
        textAlignVertical: "center",
        fontFamily: "Poppins",
        fontSize: 18,
        padding: 5,
        borderRightColor: "black",
        borderRightWidth: 2,
    },
    inputContainer: {
        // marginVertical: 5
    },
    input: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 8,
        fontSize: 16,
        fontFamily: "Poppins",
        paddingLeft: 25,
        textAlignVertical: "center",
    },
    validationErrBlock: {
        alignItems: "center",
    }
})
export default LoginForm;