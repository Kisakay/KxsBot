import { config } from "../shared";
import { bot } from "../bot";
import WebSocket from "ws";
import { EventEmitter } from "events";

export const ws_kxs_network_url = "wss://" + config.KXS_NETWORK_URL;
export const http_kxs_network_url = "https://" + config.KXS_NETWORK_URL;

export const config_json_kxs_client = "https://raw.githubusercontent.com/Kisakay/KxsClient/refs/heads/main/config.json";
export const package_json_kxs_client = "https://raw.githubusercontent.com/Kisakay/KxsClient/refs/heads/main/package.json";

class KxsNetwork extends EventEmitter {
    // Event names as constants for better code consistency
    static readonly EVENT_AUTHENTICATED = 'authenticated';
    static readonly EVENT_DISCONNECTED = 'disconnected';
    static readonly EVENT_ON_DATA = 'on_data';
    public ws: WebSocket | null = null;
    private heartbeatInterval: number = 0;
    public isAuthenticated: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 3;
    private reconnectTimeout: number = 0;
    private reconnectDelay: number = 15000; // Initial reconnect delay of 1 second
    private kxsUsers: number = 0;
    private kxs_users: string[] = [];
    private isForced: boolean = false;

    constructor() {
        super();
    }

    connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('[KxsNetwork] WebSocket already connected');
            return;
        }

        this.ws = new WebSocket(ws_kxs_network_url);

        this.ws.onopen = () => {
            console.log('[KxsNetwork] WebSocket connection established');
            // Reset reconnect attempts on successful connection
            this.reconnectAttempts = 0;
            this.reconnectDelay = 1000;
        }

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data.toString());
            this.handleMessage(data);
        };

        this.ws.onerror = (error) => {
            console.log('WebSocket error: ' + error.type);
        };

        this.ws.onclose = () => {
            console.log('Disconnected from KxsNetwork');
            clearInterval(this.heartbeatInterval);
            this.isAuthenticated = false;
            // Emit an event when disconnected
            this.emit(KxsNetwork.EVENT_DISCONNECTED);

            // Try to reconnect
            if (!this.isForced) this.attemptReconnect();
        };
    }

    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;

            // Use exponential backoff for reconnection attempts
            const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);

            console.log(`[KxsNetwork] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);

            // Clear any existing timeout
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout);
            }

            // Set timeout for reconnection
            this.reconnectTimeout = setTimeout(() => {
                this.connect();
            }, delay) as unknown as number;
        } else {
            console.log('[KxsNetwork] Maximum reconnection attempts reached');
        }
    }

    public getUsername() {
        return bot.user?.tag;
    }

    private identify() {
        const payload = {
            op: 2,
            d: {
                username: this.getUsername(),
                isVoiceChat: false
            }
        };
        this.send(payload);
    }

    private handleMessage(_data: any) {
        const { op, d } = _data;
        switch (op) {
            case 1: //Heart
                {
                    if (d?.count) this.kxsUsers = d.count;
                    if (d?.players) this.kxs_users = d.players;
                    this.emit(KxsNetwork.EVENT_ON_DATA);
                }
                break;
            case 3: // Kxs user join game
                // WE DONT CARE
                break;
            case 7: // Global chat message
                // WE DONT CARE
                break;
            case 10: // Hello
                {
                    const { heartbeat_interval } = d;
                    this.startHeartbeat(heartbeat_interval);
                    this.identify();
                }
                break;
            case 2: // Dispatch
                {
                    if (d?.uuid) {
                        this.isAuthenticated = true;
                        // Emit an event when authenticated
                        this.emit(KxsNetwork.EVENT_AUTHENTICATED);
                    }
                }
                break;
            case 98: // VOICE CHAT UPDATE
                // WE DONT CARE
                break;
        }
    }

    private startHeartbeat(interval: number) {
        // Clear existing interval if it exists
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        this.heartbeatInterval = setInterval(() => {
            this.send({
                op: 1,
                d: {}
            });
        }, interval) as unknown as number;
    }

    private send(data: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    public disconnect(shutdown?: boolean) {
        if (this.ws) {
            this.isForced = shutdown ?? false;

            // Clear all timers
            clearInterval(this.heartbeatInterval);
            clearTimeout(this.reconnectTimeout);

            // Reset reconnection state
            this.reconnectAttempts = 0;

            // Close the connection
            this.ws.close();
        }
    }

    public reconnect() {
        this.disconnect();
        this.connect();
    }

    public getOnlineCount() {
        return this.kxsUsers;
    }

    public getKxsUsers() {
        return this.kxs_users;
    }
}

export const kxsNetwork = new KxsNetwork()