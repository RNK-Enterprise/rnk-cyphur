/**
 * RNK Cyphur - GM Moderation Window
 * Advanced moderation tools for GMs
 * Supports Foundry VTT v11, v12, and v13
 */

import { DataManager } from './DataManager.js';
import { UIManager } from './UIManager.js';
import { RNKCyphur } from './RNKCyphur.js';
import { MODULE_ID } from './Constants.js';

// Version-compatible Application class
let AppClass;
if (typeof foundry !== 'undefined' && foundry.applications?.api?.ApplicationV2) {
    const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
    AppClass = HandlebarsApplicationMixin(ApplicationV2);
} else {
    AppClass = Application;
}

export class GMModWindow extends AppClass {

    static DEFAULT_OPTIONS = {
        id: 'cyphur-gm-mod-window',
        classes: ['rnk-cyphur', 'cyphur-gm-mod', 'cyphur-window'],
        window: { title: 'CYPHUR.GMModTitle', resizable: true },
        tag: 'div',
        position: { width: 550, height: 500 }
    };

    // v11/v12 compatibility
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: 'cyphur-gm-mod-window',
            classes: ['rnk-cyphur', 'cyphur-gm-mod', 'cyphur-window'],
            title: game.i18n.localize('CYPHUR.GMModTitle'),
            template: `modules/${MODULE_ID}/templates/gm-mod.hbs`,
            width: 550,
            height: 500,
            resizable: true
        });
    }

    get title() {
        return game.i18n.localize('CYPHUR.GMModTitle');
    }

    static PARTS = {
        content: { template: `modules/${MODULE_ID}/templates/gm-mod.hbs` }
    };

    // v11/v12 compatibility
    async getData() {
        return this._prepareContext({});
    }

    async _prepareContext() {
        const privateChats = this._getConversationEntries('private');
        const actorChats = this._getConversationEntries('actor');
        const groupChats = this._getConversationEntries('group');

        return {
            privateChats,
            actorChats,
            groupChats,
            totalPrivate: privateChats.length,
            totalActors: actorChats.length,
            totalGroups: groupChats.length
        };
    }

    _onRender(context, options) {
        super._onRender?.(context, options);
        this._setupEventListeners(this.element);
        
        this.bringToFront?.();
        this._addHeaderLogo?.();
    }

    // v11/v12 compatibility
    activateListeners(html) {
        super.activateListeners?.(html);
        this._setupEventListeners(html[0] || html);
    }

    _setupEventListeners(element) {
        if (!element) return;

        // Clear conversation buttons
        element.querySelectorAll('[data-action="clearConversation"]').forEach(btn => {
            btn.addEventListener('click', (e) => this._onClearConversation(e));
        });

        // Delete conversation buttons
        element.querySelectorAll('[data-action="deleteConversation"]').forEach(btn => {
            btn.addEventListener('click', (e) => this._onDeleteConversation(e));
        });

        // View conversation buttons
        element.querySelectorAll('[data-action="viewConversation"]').forEach(btn => {
            btn.addEventListener('click', (e) => this._onViewConversation(e));
        });

        // Clear all buttons
        element.querySelector('[data-action="clearAllPrivate"]')?.addEventListener('click', () => this._onClearAllPrivate());
        element.querySelector('[data-action="clearAllActors"]')?.addEventListener('click', () => this._onClearAllActors());
        element.querySelector('[data-action="clearAllGroups"]')?.addEventListener('click', () => this._onClearAllGroups());

        // Open monitor button
        element.querySelector('[data-action="openMonitor"]')?.addEventListener('click', () => {
            UIManager.openGMMonitor();
        });

        // Refresh button
        element.querySelector('[data-action="refresh"]')?.addEventListener('click', () => {
            this.render(true);
        });
    }

    async _onClearConversation(event) {
        const item = event.currentTarget.closest('[data-conversation-id]');
        const convId = item?.dataset.conversationId;
        const type = item?.dataset.type;
        
        if (!convId) return;

        const confirmed = await Dialog.confirm({
            title: game.i18n.localize('CYPHUR.ClearConversationTitle'),
            content: game.i18n.localize('CYPHUR.ClearConversationConfirm')
        });

        if (confirmed) {
            this._clearConversation(type, convId);
            
            ui.notifications.info(game.i18n.localize('CYPHUR.ConversationCleared'));
            this.render(true);
        }
    }

    async _onDeleteConversation(event) {
        const item = event.currentTarget.closest('[data-conversation-id]');
        const convId = item?.dataset.conversationId;
        const type = item?.dataset.type;
        
        if (!convId) return;

        const confirmed = await Dialog.confirm({
            title: game.i18n.localize('CYPHUR.DeleteConversationTitle'),
            content: game.i18n.localize('CYPHUR.DeleteConversationConfirm')
        });

        if (confirmed) {
            await this._deleteConversation(type, convId);
            
            ui.notifications.info(game.i18n.localize('CYPHUR.ConversationDeleted'));
            this.render(true);
        }
    }

    _onViewConversation(event) {
        const item = event.currentTarget.closest('[data-conversation-id]');
        const convId = item?.dataset.conversationId;
        const type = item?.dataset.type;
        
        if (!convId) return;

        if (type === 'group') {
            UIManager.openGroupChat(convId);
        } else {
            const chat = DataManager.getConversation(convId);
            if (DataManager.getConversationType(convId) === 'actor') {
                UIManager.openChatForActor(chat.actorId || convId.replace(/^actor:/, ''));
            } else {
                const parts = convId.split('-');
                const otherUserId = parts.find(id => id !== game.user.id);
                if (otherUserId) UIManager.openChatFor(otherUserId);
            }
        }
    }

    async _onClearAllPrivate() {
        const confirmed = await Dialog.confirm({
            title: game.i18n.localize('CYPHUR.ClearAllPrivateTitle'),
            content: game.i18n.localize('CYPHUR.ClearAllPrivateConfirm')
        });

        if (confirmed) {
            await this._clearAllConversations('private');
            
            ui.notifications.info(game.i18n.localize('CYPHUR.AllPrivateCleared'));
            this.render(true);
        }
    }

    async _onClearAllActors() {
        const confirmed = await Dialog.confirm({
            title: game.i18n.localize('CYPHUR.Moderation.ClearAllActors'),
            content: game.i18n.localize('CYPHUR.Moderation.ClearAllActorsConfirm')
        });

        if (confirmed) {
            await this._clearAllConversations('actor');

            ui.notifications.info(game.i18n.localize('CYPHUR.Moderation.AllActorsCleared'));
            this.render(true);
        }
    }

    async _onClearAllGroups() {
        const confirmed = await Dialog.confirm({
            title: game.i18n.localize('CYPHUR.ClearAllGroupsTitle'),
            content: game.i18n.localize('CYPHUR.ClearAllGroupsConfirm')
        });

        if (confirmed) {
            await this._clearAllConversations('group');
            
            ui.notifications.info(game.i18n.localize('CYPHUR.AllGroupsCleared'));
            this.render(true);
        }
    }

    _getConversationEntries(type) {
        const source = this._getConversationStore(type);
        if (!source) return [];

        if (type === 'private') {
            return Array.from(source.entries()).map(([key, chat]) => ({
                id: key,
                name: (chat.users || []).map(id => game.users.get(id)?.name || 'Unknown').join(' <-> '),
                type,
                messageCount: chat.history?.length || 0
            }));
        }

        if (type === 'actor') {
            return Array.from(source.entries()).map(([key, chat]) => ({
                id: key,
                name: `Character: ${chat.actorName || game.actors.get(chat.actorId)?.name || 'Unknown'}`,
                type,
                messageCount: chat.history?.length || 0
            }));
        }

        return Array.from(source.values()).map(group => ({
            id: group.id,
            name: group.name,
            type,
            messageCount: group.history?.length || 0,
            memberCount: group.members?.length || 0
        }));
    }

    _getConversationStore(type) {
        if (type === 'group') return DataManager.groupChats;
        if (type === 'actor') return DataManager.actorChats;
        return DataManager.privateChats;
    }

    async _clearAllConversations(type) {
        const store = this._getConversationStore(type);
        if (!store) return;

        for (const chat of store.values()) {
            chat.history = [];
        }

        if (type === 'group') {
            await DataManager.saveGroupChats();
        } else if (type === 'actor') {
            await DataManager.saveActorChats();
        } else {
            await DataManager.savePrivateChats();
        }
    }

    async _clearConversation(type, convId) {
        if (type === 'group') {
            DataManager.clearConversation(convId, true);
            await DataManager.saveGroupChats();
            return;
        }

        const store = this._getConversationStore(type);
        store?.delete(convId);

        if (type === 'actor') {
            await DataManager.saveActorChats();
        } else {
            await DataManager.savePrivateChats();
        }
    }

    async _deleteConversation(type, convId) {
        if (type === 'group') {
            await RNKCyphur.deleteGroup(convId);
            return;
        }

        const store = this._getConversationStore(type);
        store?.delete(convId);

        if (type === 'actor') {
            await DataManager.saveActorChats();
        } else {
            await DataManager.savePrivateChats();
        }
    }

    /**
     * Bring window to front when opened
     */
    bringToFront() {
        if (this.element) {
            this.element.style.zIndex = Math.max(100, ...Array.from(document.querySelectorAll('.window-app')).map(w => parseInt(w.style.zIndex) || 0)) + 1;
            this.element.classList.add('window-focus');
        }
    }

    /**
     * Add logo to window header area
     */
    _addHeaderLogo() {
        if (!this.element) return;
        
        const windowContent = this.element.querySelector('.window-content');
        if (!windowContent || windowContent.querySelector('.cyphur-header-logo')) return;
        
        const logoContainer = document.createElement('div');
        logoContainer.className = 'cyphur-header-logo';
        logoContainer.innerHTML = '<img src="modules/rnk-cyphur/rnk-codex.jpg" alt="RNK Cyphur" title="RNK Cyphur - GM Moderation">';
        
        windowContent.insertBefore(logoContainer, windowContent.firstChild);
    }

    async close(options = {}) {
        UIManager.gmModWindow = null;
        return super.close(options);
    }
}
