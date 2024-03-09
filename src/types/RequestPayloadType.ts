import { Message } from "./MessageType";
import {Chat_} from "./ChatType";

export type RequestPayload = Message & {
    exclude_ws_channel?: string
}