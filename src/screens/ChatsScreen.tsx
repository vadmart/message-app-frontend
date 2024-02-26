import React, {memo} from "react";
import {FlatList, StyleSheet, View, Text, Pressable, Animated} from "react-native";
import ContactSearcher from "@app/components/chating/ContactSearcher";
import ChatItem from "@app/components/chating/ChatItem";
import {useChat} from "@app/context/ChatsContext";
import { Swipeable } from "react-native-gesture-handler";
import { destroyChatAndSetState } from "@app/helpers/ChatsStateAPILayer";
import {Menu, MenuOptions, MenuTrigger, MenuOption, MenuProvider} from "react-native-popup-menu";
import { useAuth } from "@app/context/AuthContext";
import ScreenNames from "@app/config";


// @ts-ignore
const ChatsScreen = memo(({navigation}) => {
    console.log("Rendering ChatsScreen");
    const {chats, setChats} = useChat();
    const {onLogout} = useAuth();

    const onRenderRightActions = (
        _progress: Animated.AnimatedInterpolation<number>,
        dragX: Animated.AnimatedInterpolation<number>
    ) => {
        const trans = dragX.interpolate({
            inputRange: [-80, 0],
            outputRange: [1, 0],
            extrapolate: "extend"
        })
        return (
            <Animated.View style={{flex: 1, 
                            backgroundColor: "rgb(240, 80, 20)", 
                            alignItems: "flex-end", 
                            justifyContent: "center", 
                            paddingHorizontal: 30,
                            transform: [{translateX: trans}]
                            }}>
                <Pressable>      
                    <Text style={{color: "white", fontSize: 15}}>Видалити</Text>
                </Pressable>
            </Animated.View>
        )
    }

    
    return (
        <MenuProvider>
            <View style={styles.container}>
                <View style={{flexDirection: "row", justifyContent: "space-around", alignItems: "center"}}>
                        <Menu>
                            <MenuTrigger style={{rowGap: 5}}>
                                <View style={styles.menuDot}/>
                                <View style={styles.menuDot}/>
                                <View style={styles.menuDot}/>
                            </MenuTrigger>
                            <MenuOptions>
                                <MenuOption onSelect={() => {
                                    onLogout();
                                }} text={"Вийти"}/> 
                            </MenuOptions>
                        </Menu>
                    <ContactSearcher navigation={navigation}/>
                </View>
                    {(chats.length > 0) ? 
                    <FlatList data={chats}
                            renderItem={({item}) => {
                                return (
                                    <Swipeable 
                                        renderRightActions={onRenderRightActions} 
                                        onSwipeableOpen={() => {
                                            destroyChatAndSetState({chats, setChats}, item)
                                        }}>
                                        <ChatItem item={item}
                                                    navigation={navigation}
                                        />
                                    </Swipeable>
                                )
                            }}
                            keyExtractor={item => item.public_id}
                    /> : 
                    <View style={styles.noChatsBlock}>
                        <Text style={styles.noChatsLabel}>Чатів поки що немає. Час почати спілкування!</Text>
                    </View>}
            </View>
            </MenuProvider>
    )
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#007767",
        paddingTop: 10,
        rowGap: 10
    },
    noChatsBlock: {
        flex: 0.8,
        justifyContent: "center",
        alignItems: "center"
    },
    noChatsLabel: {
        fontSize: 20, 
        fontStyle: "italic", 
        color: "rgba(0.5, 0.5, 0.5, 0.5)",
        textAlign: "center"
    },
    menuDot: {
        width: 5, 
        aspectRatio: 1, 
        backgroundColor: "white", 
        borderRadius: 50
    }
})
export default ChatsScreen;