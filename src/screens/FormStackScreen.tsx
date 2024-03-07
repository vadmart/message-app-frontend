import React from "react"
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginForm from "./LoginForm";
import VerificationForm from "./VerificationForm";
import RegistrationForm from "./RegistrationForm";
import {ScreenNames} from "@app/config"


const Stack = createNativeStackNavigator();

const FormStackScreen = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{headerShown: false}}>
                <Stack.Screen component={LoginForm} name={ScreenNames.LOGIN} />
                <Stack.Screen component={RegistrationForm} name={ScreenNames.REGISTRATION} />
                <Stack.Screen component={VerificationForm} name={ScreenNames.VERIFICATION} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}
export default FormStackScreen;