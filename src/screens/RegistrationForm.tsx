import React from "react";
import PageOne from "@app/components/AccountForm/Registration/PageOne";
import PageTwo from "@app/components/AccountForm/Registration/PageTwo";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const RegistrationForm = () => {

    return (
        <Stack.Navigator initialRouteName={"RegPageOne"} screenOptions={ { headerShown: false } }>
            <Stack.Screen name={"RegPageOne"} component={PageOne} options={{title: "Registration 1"}} />
            <Stack.Screen name={"RegPageTwo"} component={PageTwo} options={{title: "Registration 2"}} />
        </Stack.Navigator>
    )
}

export default RegistrationForm;