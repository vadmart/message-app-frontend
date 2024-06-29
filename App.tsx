import "react-native-get-random-values";
import React, {StrictMode} from "react";
import {
    StyleSheet,
    StatusBar
} from "react-native";
import {
    SafeAreaProvider
  } from 'react-native-safe-area-context';
import {KeyboardProvider} from "react-native-keyboard-controller";
// @ts-ignore
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// @ts-ignore
import { NavigationContainer } from "@react-navigation/native";
// @ts-ignore
import MainStackScreen from '@app/screens/MainStackScreen';
// @ts-ignore
import {AuthProvider, useAuth} from "@app/context/AuthContext";
// # TODO: fix ts-ignore
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {OneSignal, LogLevel} from "react-native-onesignal";
// @ts-ignore
import ConnectProvider from "@app/context/ConnectionContext";
// import { StatusBar } from "expo-status-bar";
//@ts-ignore
import LoginForm from "@app/screens/LoginForm";
//@ts-ignore
import RegistrationForm from "@app/screens/RegistrationForm";
//@ts-ignore
import VerificationForm from "@app/screens/VerificationForm";
//@ts-ignore
import {ScreenNames} from "@app/config";


const Stack = createNativeStackNavigator();
OneSignal.Debug.setLogLevel(LogLevel.Verbose); // for OneSignal Debugging
OneSignal.initialize("ONESIGNAL_APP_ID");


const App = () => {
    return (
        <SafeAreaProvider>
            <KeyboardProvider enabled={false}>
                <AuthProvider>
                    <Layout />
                </AuthProvider>
            </KeyboardProvider>
        </SafeAreaProvider>
    )
}

export const Layout = () => {
    const {authState} = useAuth();
    return (
        <GestureHandlerRootView style={styles.container}>
            <StatusBar backgroundColor={'#007767'} translucent={false} barStyle={"light-content"}/>
            <StrictMode>
                <ConnectProvider>
                    <NavigationContainer>
                        <Stack.Navigator screenOptions={{headerShown: false}}>
                            {authState?.authenticated ? ( 
                                <Stack.Screen name={"Main"} component={MainStackScreen} />
                            )
                            : (
                                <>
                                    <Stack.Screen component={LoginForm} name={ScreenNames.LOGIN} />
                                    <Stack.Screen component={RegistrationForm} name={ScreenNames.REGISTRATION} />
                                    <Stack.Screen component={VerificationForm} name={ScreenNames.VERIFICATION} />
                                </>
                            )
                            }
                        </Stack.Navigator>
                    </NavigationContainer>
                </ConnectProvider>
            </StrictMode>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#007767",
    }
});
export default App;