import WebSocket from "ws";
import { config } from "../shared";

export const kxs_network = new WebSocket("wss://" + config.KXS_NETWORK_URL)

kxs_network.on("open", () => {
    kxs_network.on("message", (msg) => {
        let to_string = msg.toString();

        console.log(to_string);
    })
})