import React, {memo} from "react";
import {FlatList, StyleSheet, View, Text, Pressable, Animated} from "react-native";
import ContactSearcher from "@app/components/chating/ContactSearcher";
import ChatItem from "@app/components/chating/ChatItem";
import {useChat} from "@app/context/ChatsContext";
import { Swipeable } from "react-native-gesture-handler";


// @ts-ignore
const ChatsScreen = memo(({navigation}) => {
    console.log("Rendering ChatsScreen");
    const {chats} = useChat();

    const onRenderRightActions = (
        _progress: Animated.AnimatedInterpolation<number>,
        dragX: Animated.AnimatedInterpolation<number>
    ) => {
        const trans = dragX.interpolate({
            inputRange: [-80, 0],
            outputRange: [1, 0],
            extrapolate: "clamp"
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
        
            <View style={styles.container}>
                    <ContactSearcher navigation={navigation}/>
                    {(chats.length > 0) ? 
                    <FlatList data={chats}
                            renderItem={({item}) => {
                                return (
                                    <Swipeable 
                                        renderRightActions={onRenderRightActions} 
                                        onSwipeableOpen={() => {
                                            console.log("Swipeable is opened.")
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
    }
})
export default ChatsScreen;