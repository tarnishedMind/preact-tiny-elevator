import { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { WebSocket, WebSocketServer } from 'ws';
import { ServerMessage } from '../../src/shared/protocol';
import { startServer } from '../server';

let wss: WebSocketServer;

afterEach(() => new Promise<void>(resolve => {
    wss.clients.forEach(c => c.terminate());
    wss.close(() => resolve());
}));

async function connect() {
    wss = startServer(0);
    await new Promise(resolve => wss.once('listening', resolve));
    const { port } = wss.address() as AddressInfo;

    const socket = new WebSocket(`ws://localhost:${port}/ws`);
    const messages: ServerMessage[] = [];
    socket.on('message', data => messages.push(JSON.parse(String(data))));
    await new Promise(resolve => socket.once('open', resolve));

    const send = (msg: object) => socket.send(JSON.stringify(msg));
    const waitFor = async (count: number, type: ServerMessage['type']) => {
        const of = () => messages.filter(m => m.type === type);
        while (of().length < count) await new Promise(r => setTimeout(r, 10));
        return of();
    };
    return { send, waitFor, messages };
}

describe('people server', () => {
    it('sends a paused status on connect', async () => {
        const { waitFor } = await connect();
        const [status] = await waitFor(1, 'status');
        expect(status).toMatchObject({ running: false, config: { pattern: 'random' } });
    });

    it('streams people for the building once resumed', async () => {
        const { send, waitFor } = await connect();
        send({ type: 'hello', floorCount: 5, starterFloor: 1 });
        send({ type: 'config', config: { ratePerMin: 120, pattern: 'morning', seed: 9 } });
        send({ type: 'resume' });

        const people = await waitFor(2, 'person');
        expect(people.map(p => p.type === 'person' && p.id)).toEqual([1, 2]);
        for (const p of people) {
            if (p.type !== 'person') continue;
            expect(p.from).not.toBe(p.to);
            expect(p.from).toBeGreaterThanOrEqual(1);
            expect(p.to).toBeLessThanOrEqual(5);
        }
    });

    it('clamps bad config and ignores junk', async () => {
        const { send, waitFor } = await connect();
        send({ type: 'config', config: { ratePerMin: 10_000, pattern: 'party' } });
        const statuses = await waitFor(2, 'status');
        expect(statuses[1]).toMatchObject({ config: { ratePerMin: 120, pattern: 'random' } });
    });
});
