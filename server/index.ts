import { startServer } from './server';

const port = Number(process.env.PORT) || 3001;

startServer(port).on('listening', () => {
    console.log(`People server listening on ws://localhost:${port}/ws`);
});
