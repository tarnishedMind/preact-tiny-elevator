import { WebSocket, WebSocketServer } from 'ws';
import { ClientMessage, MAX_RATE, MIN_RATE, ServerMessage, TRAFFIC_PATTERNS, TrafficConfig } from '../src/shared/protocol';
import { createTraffic, Trip } from '../src/shared/traffic';

export const DEFAULT_CONFIG: TrafficConfig = { pattern: 'random', ratePerMin: 12, seed: 1 };

// Each connection gets its own generator, so every browser tab sees its own building.
class TrafficSession {
    private config: TrafficConfig = { ...DEFAULT_CONFIG };
    private running = false;
    private building?: { floorCount: number, starterFloor: number };
    private next?: () => Trip;
    private nextId = 1;
    private timer?: ReturnType<typeof setTimeout>;

    constructor(private socket: WebSocket) {
        this.sendStatus();
    }

    public handle(msg: ClientMessage) {
        switch (msg.type) {
            case 'hello':
                if (!isFloor(msg.floorCount) || !isFloor(msg.starterFloor) || msg.floorCount <= msg.starterFloor) return;
                this.building = { floorCount: msg.floorCount, starterFloor: msg.starterFloor };
                this.restart();
                break;
            case 'config':
                this.config = sanitizeConfig({ ...this.config, ...msg.config });
                this.restart();
                break;
            case 'pause':
                this.running = false;
                this.schedule();
                break;
            case 'resume':
                this.running = true;
                this.schedule();
                break;
        }
        this.sendStatus();
    }

    public close() {
        clearTimeout(this.timer);
    }

    // A new building or config starts the seeded sequence over.
    private restart() {
        this.next = this.building && createTraffic({ ...this.building, ...this.config });
        this.schedule();
    }

    private schedule() {
        clearTimeout(this.timer);
        if (!this.running || !this.next) return;
        this.timer = setTimeout(() => {
            const { from, to } = this.next!();
            this.send({ type: 'person', id: this.nextId++, from, to });
            this.schedule();
        }, 60_000 / this.config.ratePerMin);
    }

    private sendStatus() {
        this.send({ type: 'status', config: this.config, running: this.running });
    }

    private send(msg: ServerMessage) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(msg));
        }
    }
}

const isFloor = (n: unknown): n is number => Number.isInteger(n) && (n as number) >= 0 && (n as number) <= 1000;

function sanitizeConfig(c: TrafficConfig): TrafficConfig {
    return {
        pattern: TRAFFIC_PATTERNS.includes(c.pattern) ? c.pattern : DEFAULT_CONFIG.pattern,
        ratePerMin: Math.min(MAX_RATE, Math.max(MIN_RATE, Number(c.ratePerMin) || DEFAULT_CONFIG.ratePerMin)),
        seed: Number.isInteger(c.seed) ? c.seed : DEFAULT_CONFIG.seed,
    };
}

function parse(data: unknown): ClientMessage | null {
    try {
        const msg = JSON.parse(String(data));
        return msg && typeof msg.type === 'string' ? msg : null;
    } catch {
        return null;
    }
}

export function startServer(port: number): WebSocketServer {
    const wss = new WebSocketServer({ port, path: '/ws' });

    wss.on('connection', socket => {
        const session = new TrafficSession(socket);
        socket.on('message', data => {
            const msg = parse(data);
            if (msg) session.handle(msg);
        });
        socket.on('close', () => session.close());
    });

    return wss;
}
