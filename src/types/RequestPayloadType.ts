import { Message } from "./MessageType";
import {Chat_} from "./ChatType";


export type MessageRequestPayload = Message & { exclude_ws_channel?: string };
export type ChatRequestPayload = Chat_ & { exclude_ws_channel?: string };