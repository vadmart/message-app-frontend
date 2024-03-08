import React, {Children, createContext, useContext} from "react";

const WSChannelNameContext = createContext<string>(null);

export const useWSChannelName = () => {
    return useContext(WSChannelNameContext);
}

export const WSChannelNameProvider = ({value, children}) => {
    return <WSChannelNameContext.Provider value={value}>{children}</WSChannelNameContext.Provider>
}
