import { Message } from "@app/types/MessageType";
import { toReadableDate } from "./chats";

export default function sectionize(messages: Message[]): [{title: string, data: Message[]}] {
    const reversedMessages = [...messages].reverse();
    const sectionizedData: [{title: string, data: Message[]}] = [{title: toReadableDate(new Date(reversedMessages[0].created_at)), data: []}];
    let ind = 0;
    for (let msg of reversedMessages) {
        const currReadableDate = toReadableDate(new Date(msg.created_at));
        if (currReadableDate == sectionizedData[ind].title) {
            sectionizedData[ind].data.push(msg);
        } else {
            sectionizedData.push({title: currReadableDate, data: [msg]})
            ind++;
        }
    }
    return sectionizedData
}