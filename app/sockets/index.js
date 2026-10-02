import counterSocket from './counter.js';
import serverSocket from './server.js';
import serverSocketHome from './serverHome.js';

/**
 * @typedef {import('socket.io').Server} Server
 */

/**
 * Attaches all socket namespaces of the application.
 *
 * @author mauricio.araldi
 * @since 0.10.0
 *
 * @param {Server} io The Socket.IO server
 */
export default function registerSockets(io) {
  io.of('/counter').on('connection', counterSocket);
  io.of('/server').on('connection', serverSocket);
  io.of('/serverHome').on('connection', serverSocketHome);
}
