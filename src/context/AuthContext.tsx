import React, {createContext, useContext, useEffect, useState} from "react"
import {storage} from "@app/Storage"
import {BaseHTTPURL} from "@app/config";
import { modAxios } from "@app/config";
import {OneSignal} from "react-native-onesignal";
import {User} from "@app/types/UserType";
import axios, { AxiosResponse } from "axios";

export interface AuthState {
    access: string | null,
    refresh: string | null,
    user: User | null,
    authenticated: boolean | null
}

interface AuthProps {
    authState?: AuthState;
    onRegister?: (username: string, phone_number: string) => Promise<any>;
    onLogin?: (username: string, phone_number: string) => Promise<any>;
    onVerify?: (username: string, phone_number: string, otpCode: string) => Promise<any>;
    onResend?: (username: string, phone_number: string) => Promise<any>;
    onRefresh?: (refresh: string) => Promise<AxiosResponse>
    onLogout?: () => void
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
            try {
                const auth = JSON.parse(storage.getString("auth"));
                console.log(auth);
                await tokenVerify(auth.access);
                setAuthState({
                    access: auth.access,
                    refresh: auth.refresh,
                    user: auth.user,
                    authenticated: true
                });
            }
            catch (e) {
                console.log(e);
                setAuthState({
                    ...authState,
                    authenticated: false
                })
            }
        }
        loadAuthData();
    }, []);

    const register = async (username: string, phone_number: string) => {
        try {
            return await axios.post(BaseHTTPURL + "auth/register/", {username, phone_number})
        } catch(e) {
            return {error: true, msg: (e).response.data}
        }
    }

    const login = async (username: string, phone_number: string) => {
        try {
            return await axios.post(BaseHTTPURL + "auth/login/",
                {username, phone_number});
        } catch (e) {
            return {error: true, msg: (e).response.data}
        }
    }

    const verify = async (username: string, phone_number: string, otp: string) => {
        try {
            const response = await axios.post(BaseHTTPURL + "auth/verify/", {
                username,
                phone_number,
                otp
            });
            setAuthState({
                access: response.data.access,
                refresh: response.data.refresh,
                user: response.data.user,
                authenticated: true
            });
            modAxios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;
            storage.set("auth", JSON.stringify(response.data));
            if (!(await OneSignal.User.pushSubscription.getIdAsync())) {
                OneSignal.login(response.data.user.public_id);
            }
            return response
        } catch (e) {
            return {error: true, msg: (e as any).response.data}
        }
    }

    const tokenVerify = async (accessToken: string) => {
        return await modAxios.post(BaseHTTPURL + "auth/token/verify/", 
            {
                token: accessToken
        })
    }

    const logout = () => {
        storage.delete("auth");
        setAuthState({
            user: null,
            access: null,
            refresh: null,
            authenticated: false
        });
    }

    const resend = async (username: string, phone_number: string) => {
        try {
            return await axios.post(BaseHTTPURL + "auth/verify/resend/",
            {username, phone_number})
        } catch (e) {
            if (e.response) {
                console.error(e.response.data);
            } else {
                console.error(e);
            }
        }
    }

    const refresh = async (refresh: string) => {
        return await axios.post(BaseHTTPURL + "auth/token/refresh/", {refresh})
    }

    const authValue = {
        onRegister: register,
        onLogin: login,
        onVerify: verify,
        onLogout: logout,
        onResend: resend,
        onRefresh: refresh,
        authState
    };
    return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
}

