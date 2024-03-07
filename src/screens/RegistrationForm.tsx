import React, {useState} from "react";
import { StyleSheet, View, Image, TextInput, Pressable, Text  } from "react-native";
import { errInputStyle, errLabelStyle } from "@app/helpers/errorStyle";
import { useAuth } from "@app/context/AuthContext"
import FormButton from "@app/components/AccountForm/FormNavigationButton"
import FormNavigationButton from "@app/components/AccountForm/FormRedirectButton";
import FormContainer from "@app/components/AccountForm/FormContainer";
import {ScreenNames} from "@app/config";



const RegistrationForm = ({ navigation }) => {
    const [username, onChangeUsername] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const countryCode = "+380";
    const [phoneNumber, onChangePhoneNumber] = useState("");
    const [phoneNumberError, setPhoneNumberError] = useState("");
    const [validationErrText, setValidationErrText] = useState("");
    const {onRegister} = useAuth();


    async function handleRegistrationSubmit(e) {
        if (!username) {
            setUsernameError("Поле не може бути порожнім.");
            return
        }
        if (!phoneNumber) {
            setPhoneNumberError("Поле не може бути порожнім.");
            return
        }
        const response = await onRegister(username, countryCode + phoneNumber);
        if (response.error) {
            if (response.msg.username) {
                setUsernameError(response.msg.username);
                return
            }  
            if (response.msg.phone_number) {
                setPhoneNumberError(response.msg.phone_number)
                return
            }
            let errors = "";
            for (let val of Object.values<string>(response.msg)) {
                errors += `\n${val}`;
            }
            setValidationErrText(errors);
        } else {
            navigation.navigate(ScreenNames.VERIFICATION, {username, phoneNumber: "+380" + phoneNumber})
        }
    }

    return (
        <View style={{flex: 1, backgroundColor: "#007767", justifyContent: "center"}}>
            <FormContainer title={"Реєстрація"}
                            bottomButtonText={"Продовжити"}
                            bottomButtonOnPress={handleRegistrationSubmit}>
                    <View style={styles.loginBlock}>
                        <FormNavigationButton text={"Вхід"} onSubmit={() => navigation.navigate(ScreenNames.LOGIN)} />
                    </View>
                    <View style={styles.inputContainer}>
                        <View>
                            <TextInput style={[styles.input, usernameError && errInputStyle]}
                                onChangeText={onChangeUsername}
                                onChange={() => {
                                    if (usernameError) {
                                        setUsernameError("");
                                    }
                                }}
                                placeholder={"Ім'я користувача"}
                                placeholderTextColor={usernameError ? "#FF000025" : "#17171729"}
                                value={username}
                            />
                            <Text style={{color: errInputStyle.color}}>{usernameError}</Text>
                        </View>
                        <View style={[styles.phoneInputContainer]}>
                            <View style={[styles.phoneInputBlock, phoneNumberError && errInputStyle]}>
                                <Text style={styles.phoneCode}>+380</Text>
                                <TextInput style={[styles.phoneNumberInput, {fontSize: (phoneNumber) ? 18 : 15}]}
                                    keyboardType={"decimal-pad"}
                                    onChangeText={onChangePhoneNumber}
                                    onChange={() => {
                                        if (phoneNumberError) {
                                            setPhoneNumberError("");
                                        }
                                    }}
                                    placeholder={"Номер телефону"}
                                    placeholderTextColor={"#17171729"}
                                    value={phoneNumber}
                                />
                            </View>
                            <Text style={{color: errInputStyle.color}}>{phoneNumberError}</Text>
                        </View>
                    </View>
                    <View style={styles.validationErrBlock}>
                        <Text style={errLabelStyle}>{validationErrText}</Text>
                    </View>
            </FormContainer>
        </View>
    )
}

const styles = StyleSheet.create({
    formTitle: {
        fontSize: 25,
        color: "white",
    },
    topBlock: {
        flex: 0.3,
        justifyContent: "flex-end"
    },
    mainBlock: {
        flex: 0.7,
        width: "70%",
        marginTop: 30,
    },
    buttonBlock: {
        flexDirection: "row",
        columnGap: 5,
        justifyContent: "center",
        marginTop: 50,
    },
    inputContainer: {
        marginVertical: 15,
        rowGap: 5,
    },
    loginBlock: {
        alignItems: "flex-end",
    },
    phoneInputContainer: {

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
        paddingTop: 5,
        borderRightColor: "black",
        borderRightWidth: 2,
        flex: 0.2,
    },
    phoneNumberInput: {
        height: 50,
        flex: 0.8,
        paddingLeft: 8,
        textAlignVertical: "center"
    },
    input: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 8,
        paddingTop: 10,
        fontSize: 16,
        fontFamily: "Poppins",
        paddingLeft: 25,
        textAlignVertical: "center"
    },
    validationErrBlock: {
        alignItems: "center",
    }
})
export default RegistrationForm;