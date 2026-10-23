import { PeopleFeed } from '../hooks/usePeopleFeed';
import { MAX_RATE, MIN_RATE, TRAFFIC_PATTERNS, TrafficPattern } from '../shared/protocol';

export default function TrafficControls({ feed }: { feed: PeopleFeed }) {
    const { connected, running, config, setConfig, setRunning } = feed;
    const disabled = !connected || !config;

    return (
        <div className="traffic">
            <span className={`traffic__dot ${connected ? 'traffic__dot--on' : ''}`}
                title={connected ? 'Connected to the people server' : 'People server offline (npm run server)'} />
            <span>Server traffic</span>

            <button disabled={disabled} onClick={() => setRunning(!running)}>
                {running ? 'Pause traffic' : 'Start traffic'}
            </button>

            <select disabled={disabled} value={config?.pattern}
                onChange={e => setConfig({ pattern: e.currentTarget.value as TrafficPattern })}>
                {TRAFFIC_PATTERNS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <label>
                <input type="range" min={MIN_RATE} max={MAX_RATE} disabled={disabled} value={config?.ratePerMin}
                    onChange={e => setConfig({ ratePerMin: Number(e.currentTarget.value) })} />
                {config ? `${config.ratePerMin}/min` : ''}
            </label>

            <label>
                seed
                <input type="number" className="traffic__seed" disabled={disabled} value={config?.seed}
                    onChange={e => setConfig({ seed: Math.trunc(Number(e.currentTarget.value)) })} />
            </label>
        </div>
    );
}
