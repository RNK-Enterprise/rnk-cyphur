/**
 * RNK Cyphur - Data Utility
 * Group management, search, and export utilities.
 */

import { DataStore } from './DataStore.js';
import { DataUserUI } from './DataUserUI.js';

export class DataUtility {
    static createGroup(name, members) {
        const id = foundry.utils.randomID();
        const group = {
            id: id,
            name: name,
            members: [...new Set(members)],
            history: [],
            createdAt: Date.now(),
            createdBy: game.user.id
        };
        DataStore.groupChats.set(id, group);
        return group;
    }

    static updateGroup(id, updates) {
        const group = DataStore.groupChats.get(id);
        if (!group) return false;
        Object.assign(group, updates);
        return true;
    }

    static deleteGroup(id) {
        return DataStore.groupChats.delete(id);
    }

    static exportConversation(id, isGroup = false) {
        const chat = isGroup ? DataStore.groupChats.get(id) : DataStore.privateChats.get(id);
        if (!chat || !chat.history) return '';
        const lines = [];
        const title = isGroup ? `Group: ${chat.name || 'Unknown'}` : 'Private Chat';
        lines.push('═══════════════════════════════════════');
        lines.push(`Cyphur Chat Export - ${title}`);
        lines.push(`Exported: ${new Date().toLocaleString()}`);
        lines.push('═══════════════════════════════════════');
        lines.push('');
        const sorted = [...chat.history].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        for (const msg of sorted) {
            const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'Unknown';
            const sender = msg.senderName || 'Unknown';
            const content = (msg.messageContent || '').replace(/<[^>]*>/g, '');
            lines.push(`[${time}] ${sender}:`);
            lines.push(`  ${content}`);
            if (msg.imageUrl) lines.push(`  [Image: ${msg.imageUrl}]`);
            lines.push('');
        }
        lines.push('═══════════════════════════════════════');
        return lines.join('\n');
    }

    static getUserConversations() {
        const userId = game.user.id;
        const convs = [];
        for (const [key, chat] of DataStore.privateChats.entries()) {
            if (!chat.users?.includes(userId)) continue;
            const otherId = chat.users.find(id => id !== userId);
            const otherUser = game.users.get(otherId);
            convs.push({
                id: key,
                type: 'private',
                name: otherUser?.name || 'Unknown User',
                avatar: otherUser?.avatar,
                lastMessage: chat.history?.[chat.history.length - 1] || null,
                unread: DataStore.unreadCounts.get(key) || 0,
                isFavorite: DataStore.favorites.has(key),
                isMuted: DataStore.mutedConversations.has(key),
                lastActivity: DataStore.lastActivity.get(key) || 0
            });
        }
        for (const [id, group] of DataStore.groupChats.entries()) {
            if (!group.members?.includes(userId)) continue;
            convs.push({
                id: id,
                type: 'group',
                name: group.name || 'Unnamed Group',
                members: group.members,
                lastMessage: group.history?.[group.history.length - 1] || null,
                unread: DataStore.unreadCounts.get(id) || 0,
                isFavorite: DataStore.favorites.has(id),
                isMuted: DataStore.mutedConversations.has(id),
                lastActivity: DataStore.lastActivity.get(id) || 0
            });
        }
        return convs.sort((a, b) => (b.isFavorite - a.isFavorite) || (b.lastActivity - a.lastActivity));
    }
}
