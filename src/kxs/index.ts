import { config } from "../shared";
import { bot } from "../bot";

import { KxsNetwork as KxsNetworkClass } from "kxs.rip";
export const ws_kxs_network_url = "wss://" + config.KXS_NETWORK_URL;
export const http_kxs_network_url = "https://" + config.KXS_NETWORK_URL;

export const config_json_kxs_client = "https://raw.githubusercontent.com/Kisakay/KxsClient/refs/heads/main/config.json";
export const package_json_kxs_client = "https://raw.githubusercontent.com/Kisakay/KxsClient/refs/heads/main/package.json";


export const kxsNetwork = new KxsNetworkClass({
    wsUrl: ws_kxs_network_url,
    apiUrl: http_kxs_network_url,
    maxReconnectAttempts: Infinity,
    reconnectDelay: 5000
})

kxsNetwork.on("connected", () => {
    if (!bot?.user?.tag) return;
    kxsNetwork.identify(bot.user.tag)
})

kxsNetwork.connect();