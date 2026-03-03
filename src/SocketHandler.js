/**
 * RNK Cyphur - Socket Handler
 * Turbo-level component for managing module-wide WebSocket communications.
 */

import { SOCKET_NAME, SOCKET_EVENTS } from './Constants.js';
import { SocketListeners } from './sockets/SocketListeners.js';
import { SocketEmitters } from './sockets/SocketEmitters.js';

export class SocketHandler {
    static initialize() {
        game.socket.on(SOCKET_NAME, (data) => this._onSocketMessage(data));
    }

    static async _onSocketMessage(data) {
        switch (data.type) {
            case SOCKET_EVENTS.PRIVATE_MESSAGE:
                await SocketListeners.handlePrivateMessage(data.payload);
                break;
            case SOCKET_EVENTS.GROUP_MESSAGE:
                await SocketListeners.handleGroupMessage(data.payload);
                break;
            case SOCKET_EVENTS.TYPING:
                SocketListeners.handleTyping(data.payload);
                break;
            case SOCKET_EVENTS.EDIT_MESSAGE:
                await SocketListeners.handleEditMessage?.(data.payload);
                break;
            case SOCKET_EVENTS.DELETE_MESSAGE:
                await SocketListeners.handleDeleteMessage?.(data.payload);
                break;
            case SOCKET_EVENTS.ADD_REACTION:
                await SocketListeners.handleAddReaction?.(data.payload);
                break;
            default:
                break;
        }
    }

    // Proxy emitters for backwards compatibility
    static emit(type, payload, options) { SocketEmitters.emit(type, payload, options); }
    static sendPrivateMessage(id, msg) { SocketEmitters.sendPrivateMessage(id, msg); }
    static sendGroupMessage(id, msg) { SocketEmitters.sendGroupMessage(id, msg); }
    static sendTypingIndicator(id, typ, grp) { SocketEmitters.sendTypingIndicator(id, typ, grp); }
}
