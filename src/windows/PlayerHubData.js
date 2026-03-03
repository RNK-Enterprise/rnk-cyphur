/**
 * RNK Cyphur - Player Hub Data
 * Engine for preparation and formatting of Player Hub data.
 */

import { MODULE_ID } from '../Constants.js';
import { DataManager } from '../DataManager.js';

export class PlayerHubData {
    static async getHubContext(activeTab) {
        const currentUser = game.user;
        const conversations = this._getConversations(currentUser);
        const users = this._getUsers(currentUser);
        
        const settings = this._getSettings();

        return {
            conversations,
            users: users.all,
            gmUsers: users.gms,
            playerUsers: users.players,
            isGM: game.user.isGM,
            totalUnread: DataManager.getTotalUnread() || 0,
            activeTab: activeTab,
            enableSounds: settings.enableSounds,
            soundVolume: settings.soundVolume * 100,
            enableNotifications: settings.enableNotifications,
            moduleId: MODULE_ID
        };
    }

    static _getConversations(currentUser) {
        const convs = [];
        const groupChats = DataManager.groupChats;
        const privateChats = DataManager.privateChats;

        if (groupChats) {
            for (const group of groupChats.values()) {
                if (!group.members?.includes(currentUser.id)) continue;
                const unread = DataManager.getUnreadCount?.(group.id) || 0;
                const lastMsg = group.history?.slice(-1)[0];
                convs.push({
                    id: group.id,
                    name: group.name,
                    type: 'group',
                    icon: 'fa-users',
                    unreadCount: unread,
                    hasUnread: unread > 0,
                    isFavorite: DataManager.isFavorite?.(group.id),
                    lastActivity: lastMsg?.timestamp || group.createdAt || 0,
                    lastMessage: lastMsg ? {
                        preview: this._getMessagePreview(lastMsg),
                        time: this._formatRelativeTime(lastMsg.timestamp)
                    } : null
                });
            }
        }

        if (privateChats) {
            for (const chat of privateChats.values()) {
                if (!chat.users?.includes(currentUser.id)) continue;
                const otherId = chat.users.find(id => id !== currentUser.id);
                const otherUser = game.users.get(otherId);
                if (!otherUser) continue;
                const key = DataManager.getPrivateChatKey?.(chat.users[0], chat.users[1]);
                const unread = DataManager.getUnreadCount?.(key) || 0;
                const lastMsg = chat.history?.slice(-1)[0];
                convs.push({
                    id: key,
                    name: otherUser.name,
                    type: 'private',
                    icon: 'fa-user-secret',
                    unreadCount: unread,
                    hasUnread: unread > 0,
                    isFavorite: DataManager.isFavorite?.(key),
                    isOnline: otherUser.active,
                    avatar: otherUser.avatar,
                    otherUserId: otherId,
                    lastActivity: lastMsg?.timestamp || 0,
                    lastMessage: lastMsg ? {
                        preview: this._getMessagePreview(lastMsg),
                        time: this._formatRelativeTime(lastMsg.timestamp)
                    } : null
                });
            }
        }

        return convs.sort((a, b) => (b.isFavorite - a.isFavorite) || (b.lastActivity - a.lastActivity));
    }

    static _getUsers(currentUser) {
        const all = game.users
            .filter(u => u.id !== currentUser.id)
            .map(u => ({
                id: u.id,
                name: u.name,
                isOnline: u.active,
                isGM: u.isGM,
                avatar: u.avatar,
                color: u.color || '#cccccc'
            }))
            .sort((a, b) => b.isOnline - a.isOnline || a.name.localeCompare(b.name));
            
        return {
            all,
            gms: all.filter(u => u.isGM),
            players: all.filter(u => !u.isGM)
        };
    }

    static _getSettings() {
        return {
            enableSounds: game.settings.get(MODULE_ID, 'enableSounds'),
            soundVolume: game.settings.get(MODULE_ID, 'notificationVolume'),
            enableNotifications: game.settings.get(MODULE_ID, 'enableDesktopNotifications')
        };
    }

    static _getMessagePreview(msg) {
        if (!msg) return '';
        let content = (msg.messageContent || '').replace(/<[^>]*>/g, '').trim();
        return content.length > 50 ? content.substring(0, 50) + '...' : content;
    }

    static _formatRelativeTime(time) {
        if (!time) return '';
        const diff = Date.now() - time;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h`;
        return `${Math.floor(hrs / 24)}d`;
    }
}
