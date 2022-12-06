import debugRaw from 'debug';
import app from './app';

const debug = debugRaw('app:http');

// Set port from env or by default 8080
const port = +(process.env.PORT || '8080');

const server = app.listen(port, () => {
  debug(`Running on ${port}`);
});

process.on('SIGTERM', () => {
  debug('SIGTERM signal received, closing the HTTP server');
  server.close(() => {
    debug('HTTP server closed');
  });
});
