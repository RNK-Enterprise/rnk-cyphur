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

    static async handleEditMessage(payload) {
        const { conversationId, messageId, newContent, isGroup } = payload;
        if (!conversationId || !messageId) return;

        DataManager.editMessage(conversationId, messageId, newContent, isGroup);
        if (isGroup) UIManager.updateChatWindow(conversationId, 'group');
        else {
            const otherUserId = conversationId.split('-').find(id => id !== game.user.id);
            if (otherUserId) UIManager.updateChatWindow(otherUserId, 'private');
        }
        UIManager.updatePlayerHub();
    }

    static async handleDeleteMessage(payload) {
        const { conversationId, messageId, isGroup } = payload;
        if (!conversationId || !messageId) return;

        DataManager.deleteMessage(conversationId, messageId, isGroup);
        if (isGroup) UIManager.updateChatWindow(conversationId, 'group');
        else {
            const otherUserId = conversationId.split('-').find(id => id !== game.user.id);
            if (otherUserId) UIManager.updateChatWindow(otherUserId, 'private');
        }
        UIManager.updatePlayerHub();
    }

    static async handleAddReaction(payload) {
        const { conversationId, messageId, emoji, userId, isGroup } = payload;
        if (!conversationId || !messageId || !emoji || !userId) return;

        DataManager.addReaction(conversationId, messageId, emoji, userId, isGroup);
        if (isGroup) UIManager.updateChatWindow(conversationId, 'group');
        else {
            const otherUserId = conversationId.split('-').find(id => id !== game.user.id);
            if (otherUserId) UIManager.updateChatWindow(otherUserId, 'private');
        }
    }

    static async handleGroupCreate(payload) {
        const group = payload?.group;
        if (!group?.id) return;
        if (!game.user.isGM && !group.members?.includes(game.user.id)) return;

        DataManager.groupChats.set(group.id, group);
        UIManager.updatePlayerHub();
        UIManager.updateGroupManager();
    }

    static async handleGroupUpdate(payload) {
        const group = payload?.group;
        const groupId = payload?.groupId || group?.id;
        if (!groupId || !group) return;

        const isRelevant = game.user.isGM || group.members?.includes(game.user.id);
        if (!isRelevant) {
            DataManager.deleteGroup(groupId);
            UIManager.closeChatWindow(groupId, 'group');
        } else {
            DataManager.groupChats.set(groupId, group);
            UIManager.updateChatWindow(groupId, 'group');
        }

        UIManager.updatePlayerHub();
        UIManager.updateGroupManager();
    }

    static async handleGroupDelete(payload) {
        const { groupId } = payload || {};
        if (!groupId) return;

        DataManager.deleteGroup(groupId);
        UIManager.closeChatWindow(groupId, 'group');
        UIManager.updatePlayerHub();
        UIManager.updateGroupManager();
    }
}
