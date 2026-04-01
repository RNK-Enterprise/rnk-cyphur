/**
 * RNK Cyphur - Socket Emitters
 * Engine for sending socket messages.
 */

import { SOCKET_EVENTS, SOCKET_NAME } from '../Constants.js';
import { DataManager } from '../DataManager.js';

export class SocketEmitters {
    static emit(type, payload, options = {}) {
        game.socket.emit(SOCKET_NAME, { type, payload }, options);
    }

    static sendPrivateMessage(recipientId, message) {
        const recipients = [recipientId];
        this.emit(SOCKET_EVENTS.PRIVATE_MESSAGE, { recipientId, message }, { recipients });

        // Monitoring
        const gms = game.users.filter(u => u.isGM && u.active && u.id !== game.user.id);
        if (gms.length > 0) {
            this.emit(SOCKET_EVENTS.PRIVATE_MESSAGE, {
                recipientId: game.user.id,
                message,
                isMonitoring: true,
                originalSenderId: game.user.id,
                originalRecipientId: recipientId
            }, { recipients: gms.map(u => u.id) });
        }
    }

    static sendGroupMessage(groupId, message) {
        const group = DataManager.groupChats.get(groupId);
        if (!group) return;
        const recipients = group.members.filter(id => id !== game.user.id);
        this.emit(SOCKET_EVENTS.GROUP_MESSAGE, { groupId, message }, { recipients });

        // Monitoring
        const gms = game.users.filter(u => u.isGM && u.active && !group.members.includes(u.id));
        if (gms.length > 0) {
            this.emit(SOCKET_EVENTS.GROUP_MESSAGE, { groupId, message, isMonitoring: true }, { recipients: gms.map(u => u.id) });
        }
    }

    static sendTypingIndicator(conversationId, isTyping, isGroup) {
        let recipients = [];
        if (isGroup) {
            recipients = DataManager.groupChats.get(conversationId)?.members || [];
        } else {
            recipients = conversationId.split('-').filter(id => id !== game.user.id);
        }
        recipients = recipients.filter(id => id !== game.user.id);
        if (!recipients.length) return;
        this.emit(SOCKET_EVENTS.TYPING, { conversationId, userId: game.user.id, isTyping, isGroup }, { recipients });
    }

    static broadcastGroupCreate(group) {
        if (!group) return;
        this.emit(SOCKET_EVENTS.GROUP_CREATE, { group });
    }

    static broadcastGroupUpdate(groupId, group) {
        if (!groupId || !group) return;
        this.emit(SOCKET_EVENTS.GROUP_UPDATE, { groupId, group });
    }

    static broadcastGroupDelete(groupId, members = []) {
        if (!groupId) return;
        this.emit(SOCKET_EVENTS.GROUP_DELETE, { groupId, members });
    }

    static broadcastEditMessage(conversationId, messageId, newContent, isGroup = false) {
        if (!conversationId || !messageId) return;
        this.emit(SOCKET_EVENTS.EDIT_MESSAGE, { conversationId, messageId, newContent, isGroup });
    }

    static broadcastDeleteMessage(conversationId, messageId, isGroup = false) {
        if (!conversationId || !messageId) return;
        this.emit(SOCKET_EVENTS.DELETE_MESSAGE, { conversationId, messageId, isGroup });
    }

    static broadcastReaction(conversationId, messageId, emoji, isGroup = false) {
        if (!conversationId || !messageId || !emoji) return;
        this.emit(SOCKET_EVENTS.ADD_REACTION, {
            conversationId,
            messageId,
            emoji,
            isGroup,
            userId: game.user.id
        });
    }
}
