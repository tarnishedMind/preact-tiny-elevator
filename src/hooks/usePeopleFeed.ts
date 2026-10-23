import { useEffect, useRef, useState } from 'preact/hooks';
import { ClientMessage, ServerMessage, TrafficConfig } from '../shared/protocol';

interface Building {
    floorCount: number;
    starterFloor: number;
}

export interface PeopleFeed {
    connected: boolean;
    running: boolean;
    config?: TrafficConfig;
    setConfig: (config: Partial<TrafficConfig>) => void;
    setRunning: (running: boolean) => void;
}

const MAX_RETRY_MS = 10_000;

// Connects to the people server and calls onPerson for every generated person.
// Reconnects with backoff, so the app keeps working offline and picks the feed up later.
export function usePeopleFeed(building: Building, onPerson: (from: number, to: number) => void): PeopleFeed {
    const [connected, setConnected] = useState(false);
    const [running, setRunningState] = useState(false);
    const [config, setConfigState] = useState<TrafficConfig>();

    const socket = useRef<WebSocket>();
    const latest = useRef({ building, onPerson });
    latest.current = { building, onPerson };

    const send = (msg: ClientMessage) => {
        if (socket.current?.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify(msg));
        }
    };

    useEffect(() => {
        let retryMs = 500;
        let retryTimer: ReturnType<typeof setTimeout>;
        let disposed = false;

        const connect = () => {
            const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
            const ws = new WebSocket(`${protocol}://${location.host}/ws`);
            socket.current = ws;

            ws.onopen = () => {
                retryMs = 500;
                setConnected(true);
                send({ type: 'hello', ...latest.current.building });
            };
            ws.onmessage = (event) => {
                const msg: ServerMessage = JSON.parse(event.data);
                if (msg.type === 'person') {
                    latest.current.onPerson(msg.from, msg.to);
                } else if (msg.type === 'status') {
                    setConfigState(msg.config);
                    setRunningState(msg.running);
                }
            };
            ws.onclose = () => {
                setConnected(false);
                setRunningState(false);
                if (disposed) return;
                retryTimer = setTimeout(connect, retryMs);
                retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
            };
        };

        connect();
        return () => {
            disposed = true;
            clearTimeout(retryTimer);
            socket.current?.close();
        };
    }, []);

    // A different building restarts the server's sequence for it.
    useEffect(() => {
        send({ type: 'hello', ...building });
    }, [building.floorCount, building.starterFloor]);

    return {
        connected,
        running,
        config,
        setConfig: (c) => send({ type: 'config', config: c }),
        setRunning: (r) => send({ type: r ? 'resume' : 'pause' }),
    };
}
