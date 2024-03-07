import "react-native-get-random-values";
import React, {StrictMode} from "react";
import {
    StyleSheet,
    StatusBar
} from "react-native";
// @ts-ignore
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import FormStackScreen from "@app/screens/FormStackScreen"


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
            <StatusBar backgroundColor={'#007767'} translucent={false} barStyle={"light-content"}/>
            {authState?.authenticated ? ( 
                <StrictMode>
                    <ConnectProvider>
                        <MainStackScreen />
                    </ConnectProvider>
                </StrictMode>
            )
            : (
                <FormStackScreen />
            )
            }
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