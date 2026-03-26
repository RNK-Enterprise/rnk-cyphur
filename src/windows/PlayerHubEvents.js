/**
 * RNK Cyphur - Player Hub Events
 * Engine for handling UI events in the Player Hub.
 */

import { MODULE_ID } from '../Constants.js';
import { UIManager } from '../UIManager.js';
import { DataManager } from '../DataManager.js';
import { PlayerHubUtils } from './PlayerHubUtils.js';
import { Utils } from '../Utils.js';

export class PlayerHubEvents {
    static activateListeners(app, element) {
        // Tab switching
        element.querySelectorAll('[data-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                app.activeTab = e.currentTarget.dataset.tab;
                this._updateTabs(element, app.activeTab);
            });
        });

        // Event Delegation for data-actions
        element.addEventListener('click', async (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;

            switch (action) {
                case 'createChat':
                    this._onCreateChat(element);
                    break;
                case 'openMonitor':
                    UIManager.openGMMonitor();
                    break;
                case 'openGroupManager':
                    UIManager.openGroupManager();
                    break;
                case 'openGMTools':
                    UIManager.openGMModWindow();
                    break;
                case 'exportToJournal':
                    PlayerHubUtils.exportToJournal();
                    break;
                case 'exportLocal':
                    PlayerHubUtils.exportLocal();
                    break;
                case 'setUserBackground':
                    this._onSetUserBackground(btn.dataset.userId);
                    break;
            }
        });

        // Conversation clicks (for Chats tab)
        element.querySelectorAll('.cyphur-conv-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.cyphur-conv-action')) return;

                const convId = item.dataset.conversationId;
                const type = item.dataset.type;

                if (e.target.closest('.cyphur-fav-icon')) {
                    const id = convId || DataManager.getPrivateChatKey(game.user.id, item.dataset.userId);
                    DataManager.toggleFavorite(id);
                    UIManager.updatePlayerHub();
                    Utils.playUISound('buttonPress');
                    return;
                }

                if (type === 'group') UIManager.openGroupChat(convId);
                else UIManager.openChatFor(item.dataset.userId);
            });
        });

        // User selection in New Chat tab
        element.querySelectorAll('.cyphur-user-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                card.classList.toggle('selected');
                
                const startBtn = element.querySelector('[data-action="createChat"]');
                const selected = element.querySelectorAll('.cyphur-user-card.selected');
                const selectedCount = selected.length;
                
                if (startBtn) {
                    const iconClass = selectedCount > 1 ? 'fa-comments' : 'fa-comment';
                    const btnText = selectedCount > 1 ? `Start Group Chat (${selectedCount})` : 'Start Chat';
                    startBtn.innerHTML = `<i class="fas ${iconClass}"></i> ${btnText}`;
                    
                    // Visual feedback for disabled state
                    if (selectedCount === 0) {
                        startBtn.style.opacity = '0.5';
                        startBtn.style.cursor = 'not-allowed';
                    } else {
                        startBtn.style.opacity = '1';
                        startBtn.style.cursor = 'pointer';
                    }
                }
            });
        });

        // Volume & Settings
        element.querySelector('[data-action="setVolume"]')?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value) || 0;
            game.settings.set(MODULE_ID, 'notificationVolume', value / 100);

            const volumeDisplay = element.querySelector('.cyphur-volume-value');
            if (volumeDisplay) volumeDisplay.textContent = `${value}%`;
        });

        element.querySelectorAll('input[type="checkbox"][data-action]').forEach(cb => {
            cb.addEventListener('change', async (e) => {
                const setting = cb.dataset.action === 'toggleSounds' ? 'enableSounds' : 'enableDesktopNotifications';
                await game.settings.set(MODULE_ID, setting, cb.checked);
            });
        });

        // Search
        element.querySelector('.cyphur-hub-search')?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            // Filter conversations
            element.querySelectorAll('.cyphur-conv-item').forEach(item => {
                const name = item.querySelector('.cyphur-conv-name')?.textContent?.toLowerCase() || '';
                item.style.display = name.includes(query) ? '' : 'none';
            });
            // Filter user cards
            element.querySelectorAll('.cyphur-user-card').forEach(card => {
                const name = card.querySelector('.cyphur-user-name')?.textContent?.toLowerCase() || '';
                card.style.display = name.includes(query) ? '' : 'none';
            });
        });
    }

    static async _onCreateChat(element) {
        const selected = Array.from(element.querySelectorAll('.cyphur-user-card.selected'))
            .map(c => c.dataset.userId);
        
        if (selected.length === 0) {
            return ui.notifications.warn("Please select at least one user.");
        }

        if (selected.length === 1) {
            UIManager.openChatFor(selected[0]);
        } else {
            new Dialog({
                title: "Create Group Chat",
                content: `
                    <div class="form-group">
                        <label>Group Name</label>
                        <input type="text" id="group-name" placeholder="Enter group name..." autofocus>
                    </div>
                `,
                buttons: {
                    create: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Create",
                        callback: async (html) => {
                            const name = html.find('#group-name').val() || "New Group";
                            const { RNKCyphur } = await import('../RNKCyphur.js');
                            await RNKCyphur.createGroup(name, [game.user.id, ...selected]);
                        }
                    },
                    cancel: { icon: '<i class="fas fa-times"></i>', label: "Cancel" }
                },
                default: "create"
            }).render(true);
        }
    }

    static async _onSetUserBackground(userId) {
        if (!userId) return;
        new FilePicker({
            type: 'image',
            callback: async (path) => {
                const bgs = game.settings.get(MODULE_ID, 'gmBackgrounds') || { global: null, perUser: {}, perChat: {} };
                if (!bgs.perUser) bgs.perUser = {};
                bgs.perUser[userId] = path;
                await game.settings.set(MODULE_ID, 'gmBackgrounds', bgs);
                UIManager.updateBackgroundForUser(userId, path);
                ui.notifications.info('Background set for user.');
            }
        }).render(true);
    }

    static _updateTabs(element, activeTab) {
        element.querySelectorAll('[data-tab]').forEach(t => {
            const isActive = t.dataset.tab === activeTab;
            t.classList.toggle('active', isActive);
            const img = t.querySelector('img[data-default][data-active]');
            if (img) img.src = isActive ? img.dataset.active : img.dataset.default;
        });
        element.querySelectorAll('.cyphur-tab-content').forEach(c => c.classList.toggle('active', c.dataset.tabContent === activeTab));
    }
}
