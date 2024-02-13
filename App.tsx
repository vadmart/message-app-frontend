import "react-native-get-random-values";
import React, {StrictMode} from "react";
import {
    StyleSheet,
    StatusBar
} from "react-native";
import { NavigationContainer } from "@react-navigation/native"
// @ts-ignore
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// @ts-ignore
import LoginForm from "@app/screens/LoginForm";
// @ts-ignore
import MainScreen from '@app/screens/MainScreen';
// @ts-ignore
import ScreenNames from '@app/config';
// @ts-ignore
import {AuthProvider, useAuth} from "@app/context/AuthContext";
// # TODO: fix ts-ignore
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {OneSignal, LogLevel} from "react-native-onesignal";
// @ts-ignore
import ConnectProvider from "@app/context/ConnectionContext"


const Stack = createNativeStackNavigator();
OneSignal.Debug.setLogLevel(LogLevel.Verbose); // for OneSignal Debugging
OneSignal.initialize("ONESIGNAL_APP_ID");


function App() {
    return (
            <AuthProvider>
                <Layout />
            </AuthProvider>
    )
}

export const Layout = () => {
    const {authState} = useAuth();
    return (
        <GestureHandlerRootView style={styles.container}>
            <StatusBar backgroundColor={'#001100'} />
            <NavigationContainer>
                <Stack.Navigator screenOptions={{headerShown: false}}>
                    {authState?.authenticated ? (
                            <Stack.Screen name={ScreenNames.MAIN_SCREEN}>
                                {() => {
                                    return <StrictMode>
                                            <ConnectProvider>
                                                <MainScreen />
                                            </ConnectProvider>
                                           </StrictMode>
                                }}
                            </Stack.Screen>
                    )
                    : (
                        <Stack.Screen component={LoginForm} name={ScreenNames.LOGIN} />
                    )
                }
                </Stack.Navigator>
            </NavigationContainer>
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