import React, {createContext, useContext, useEffect, useState} from "react"
import {storage} from "@app/Storage"
import {BaseHTTPURL} from "@app/config";
import { axiosWithConnectionRetry as axios } from "@app/config";
import {OneSignal} from "react-native-onesignal";
import {User} from "@app/types/UserType"

export interface AuthState {
    access: string | null,
    refresh: string | null,
    user: User | null,
    authenticated: boolean | null
}

interface AuthProps {
    authState?: AuthState;
    onRegister?: (data: object) => Promise<any>;
    onLogin?: (username: string, phoneNumber: string) => Promise<any>;
    onVerify?: (username: string, phoneNumber: string, otpCode: string) => Promise<any>
}

const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({children}) => {
    const [authState, setAuthState] = useState<{
        access: string | null,
        refresh: string | null,
        user: User | null,
        authenticated: boolean | null
    }>({
        access: null,
        refresh: null,
        user: null,
        authenticated: null
    });

    useEffect(() => {
        const loadAuthData = async () => {
            const authDataString = storage.getString("auth");
            console.log(authDataString);
            // TODO: change storing token-user data in MMKV
            if (!authDataString) return
            const authData = JSON.parse(authDataString);
            try {
                console.log(authData.access);
                await tokenVerify(authData.access);
                axios.defaults.headers.common['Authorization'] = `Bearer ${authData.access}`;
                setAuthState({
                    access: authData.access,
                    refresh: authData.refresh,
                    user: authData.user,
                    authenticated: true
                });
            }
            catch {
                setAuthState({
                    ...authState,
                    authenticated: false
                })
            }
        }
        loadAuthData();
    }, []);

    const login = async (username: string, phoneNumber: string) => {
        try {
            return await axios.post(BaseHTTPURL + "auth/login/",
                {username, phone_number: "+380" + phoneNumber});
        } catch (e) {
            return {error: true, msg: (e).response.data}
        }
    }

    const verify = async (username: string, phoneNumber: string, otpCode: string) => {
        try {
            console.log(username, phoneNumber, otpCode);
            const response = await axios.post(BaseHTTPURL + "auth/verify/", {
                username,
                phone_number: phoneNumber,
                otp: otpCode
            });
            setAuthState({
                access: response.data.access,
                refresh: response.data.refresh,
                user: response.data.user,
                authenticated: true
            });
            axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;
            storage.set("auth", JSON.stringify(response.data));
            OneSignal.login(response.data.user.public_id);
            return response
        } catch (e) {
            return {error: true, msg: (e as any).response.data}
        }
    }

    const tokenVerify = async (accessToken: string) => {
        return await axios.post(BaseHTTPURL + "auth/token/verify/", 
        {
            token: accessToken
        })
    }

    const authValue = {
        onRegister: async () => {},
        onLogin: login,
        onVerify: verify,
        authState
    };
    return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
}

