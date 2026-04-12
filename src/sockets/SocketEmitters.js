/**
 * RNK Cyphur - Socket Emitters
 * Engine for sending socket messages.
 */

import { SOCKET_EVENTS, SOCKET_NAME } from '../Constants.js';
import { DataManager } from '../DataManager.js';
import { ActorContacts } from '../data/ActorContacts.js';

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

    static sendActorMessage(actorId, message) {
        const actor = game.actors.get(actorId);
        if (!actor) return;

        const recipients = ActorContacts.getRecipientUserIds(actor);
        if (!recipients.length) return;

        this.emit(SOCKET_EVENTS.PRIVATE_MESSAGE, {
            recipientId: actorId,
            targetType: 'actor',
            targetId: actorId,
            conversationId: DataManager.getActorChatKey(actorId),
            actorName: actor.name,
            actorImg: actor.img,
            message
        }, { recipients });

        const gms = game.users.filter(u => u.isGM && u.active && !recipients.includes(u.id));
        if (gms.length > 0) {
            this.emit(SOCKET_EVENTS.PRIVATE_MESSAGE, {
                recipientId: actorId,
                targetType: 'actor',
                targetId: actorId,
                conversationId: DataManager.getActorChatKey(actorId),
                actorName: actor.name,
                actorImg: actor.img,
                message,
                isMonitoring: true,
                originalSenderId: game.user.id,
                originalRecipientId: actorId
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
        } else if (conversationId.startsWith('actor:')) {
            const actorId = conversationId.replace(/^actor:/, '');
            const actor = game.actors.get(actorId);
            recipients = actor ? ActorContacts.getRecipientUserIds(actor) : [];
        } else {
            recipients = conversationId.split('-').filter(id => id !== game.user.id);
        }
        recipients = recipients.filter(id => id !== game.user.id);
        if (!recipients.length) return;
        this.emit(SOCKET_EVENTS.TYPING, { conversationId, userId: game.user.id, isTyping, isGroup }, { recipients });
    }

    static sendFriendRequest(payload, recipients) {
        this.emit(SOCKET_EVENTS.FRIEND_REQUEST, payload, { recipients });
    }

    static sendFriendResponse(payload, recipients) {
        this.emit(SOCKET_EVENTS.FRIEND_RESPONSE, payload, { recipients });
    }
}
