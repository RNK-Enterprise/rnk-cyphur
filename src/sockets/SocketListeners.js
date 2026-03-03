/**
 * RNK Cyphur - Socket Listeners
 * Engine for processing incoming socket messages.
 */

import { DataManager } from '../DataManager.js';
import { UIManager } from '../UIManager.js';
import { Utils } from '../Utils.js';

export class SocketListeners {
    static async handlePrivateMessage(payload) {
        const { recipientId, message, isRelay, originalSenderId, originalRecipientId, isMonitoring } = payload;
        if (recipientId !== game.user.id && !isMonitoring && !isRelay) return;

        if (isMonitoring && game.user.isGM) {
            DataManager.addInterceptedMessage({
                senderId: originalSenderId || message.senderId,
                recipientId: originalRecipientId || recipientId,
                messageData: message
            });
            UIManager.updateGMMonitor();
            return;
        }

        const senderId = isRelay ? originalSenderId : message.senderId;
        DataManager.addPrivateMessage(senderId, recipientId, message);

        DataManager.incrementUnread(DataManager.getPrivateChatKey(senderId, recipientId));
        UIManager.openChatWindowForNewMessage(senderId, 'private');
        UIManager.updatePlayerHub();
    }

    static async handleGroupMessage(payload) {
        const { groupId, message, isMonitoring } = payload;
        const group = DataManager.groupChats.get(groupId);

        if (isMonitoring && game.user.isGM) {
            DataManager.addGroupMessage(groupId, message);
            DataManager.addInterceptedMessage({
                senderId: message.senderId,
                groupId: groupId,
                groupName: group?.name || 'Unknown',
                messageData: message
            });
            UIManager.updateGMMonitor();
            return;
        }

        if (group?.members.includes(game.user.id)) {
            DataManager.addGroupMessage(groupId, message);
            DataManager.incrementUnread(groupId);
            UIManager.openChatWindowForNewMessage(groupId, 'group');
            UIManager.updatePlayerHub();
        }
    }

    static handleTyping(payload) {
        const { conversationId, userId, isTyping, isGroup } = payload;
        if (DataManager.setTyping(conversationId, userId, isTyping)) {
            if (isGroup) UIManager.updateTypingIndicator(conversationId, 'group');
            else {
                const other = conversationId.split('-').find(id => id !== game.user.id);
                if (other) UIManager.updateTypingIndicator(other, 'private');
            }
        }
    }
}
