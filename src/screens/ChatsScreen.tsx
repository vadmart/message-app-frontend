import React, {memo} from "react";
import {FlatList, StyleSheet, View, Text} from "react-native";
import ContactSearcher from "@app/components/chating/ContactSearcher";
import ChatItem from "@app/components/chating/ChatItem";
import {useChat} from "@app/context/ChatContext";


// @ts-ignore
const ChatsScreen = memo(({navigation}) => {
    console.log("Rendering ChatsScreen");
    const {chats} = useChat();
    
    return (
        <View style={styles.container}>
            <ContactSearcher navigation={navigation}/>
            {(chats.length > 0) ? 
            <FlatList data={chats}
                      renderItem={({item}) => {
                          return (
                              <ChatItem item={item}
                                        navigation={navigation}
                              />
                          )
                      }}
                      keyExtractor={item => item.public_id}
            /> : 
            <View style={styles.noChatsBlock}>
                <Text style={styles.noChatsLabel}>Чатів немає</Text>
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
        color: "rgba(0.5, 0.5, 0.5, 0.5)"
    }
})
export default ChatsScreen;