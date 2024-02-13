import React, { createContext, useContext, useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

const ConnectionContext = createContext<{connected: boolean, 
                                         setConnected: React.Dispatch<React.SetStateAction<boolean>>}>(null);

export const useConnect = () => {
    return useContext(ConnectionContext)
}

const ConnectProvider = ({children}) => {
    const [connected, setConnected] = useState(false);
    
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            // console.log("Adding NetInfo listener");
            if (state.isConnected) {
                if (!connected)
                    setConnected(true);
            } else if (connected)
                        setConnected(false);
        })
        return unsubscribe;
    }, [])
    return <ConnectionContext.Provider value={{connected, setConnected}}>{children}</ConnectionContext.Provider>
}

export default ConnectProvider;