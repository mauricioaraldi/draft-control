/**
 * @typedef {import('socket.io').Socket} Socket
 */

/**
 * Listens to a socket event. If handling it fails, the error is logged and its message is
 * sent back to the client as an `appError` event, instead of crashing the server
 *
 * @author mauricio.araldi
 * @since 0.10.0
 *
 * @param {Socket} socket The connected client socket
 * @param {string} event Name of the event to listen to
 * @param {(data: unknown) => void} handler Function that handles the event data
 */
export default function listen(socket, event, handler) {
  socket.on(event, (data) => {
    try {
      handler(data);
    } catch (error) {
      console.error(`Error handling "${event}":`, error);
      socket.emit('appError', error.message);
    }
  });
}
