import React from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform, Text } from "react-native";
import FormButton from "./FormButton";

const FormContainer = ({title, children, bottomButtonText, bottomButtonOnPress, contentStyle={}}) => {
    return (
        <KeyboardAvoidingView style={styles.container} behavior={(Platform.OS === "ios" ? "padding" : "height")}>
            <Text style={styles.formTitle}>{title}</Text>
            <View style={[styles.formContent, contentStyle]}>
                {children}
            </View>
            <FormButton text={bottomButtonText} onPress={bottomButtonOnPress} />
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#007767",
        flex: 0.5,
    },
    formTitle: {
        fontSize: 25,
        color: "white",
        alignSelf: "center",
    },
    formContent: {
        width: "60%",
        rowGap: 10
    }
});
export default FormContainer;