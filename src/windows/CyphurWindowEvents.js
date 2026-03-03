/**
 * RNK Cyphur - Chat Window Events
 * Engine for Chat Window DOM event listeners.
 */

import { CyphurWindowActions } from './CyphurWindowActions.js';
import { CyphurWindowUI } from './CyphurWindowUI.js';
import { DataManager } from '../DataManager.js';
import { SocketHandler } from '../SocketHandler.js';
import { Utils } from '../Utils.js';
import { MODULE_ID } from '../Constants.js';

export class CyphurWindowEvents {
    static activateListeners(app, element) {
        // Form Submit listener
        element.addEventListener('submit', (e) => {
            e.preventDefault();
            app._handleFormSubmit();
        });

        const textarea = element.querySelector('textarea[name="message"]');
        if (textarea) {
            textarea.value = app._preservedInputValue || '';
            textarea.focus();
            
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    app._handleFormSubmit();
                }
            });
            textarea.addEventListener('input', () => {
                app._preservedInputValue = textarea.value;
                this._onTyping(app);
            });
        }

        // Send Button click listener
        element.querySelector('.cyphur-send-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            app._handleFormSubmit();
        });

        element.querySelector('.cyphur-image-btn')?.addEventListener('click', () => element.querySelector('.cyphur-image-input')?.click());
        element.querySelector('.cyphur-image-input')?.addEventListener('change', (e) => app._onImageSelected(e));

        // Toolbar Button listeners
        element.querySelector('.cyphur-favorite-btn')?.addEventListener('click', (e) => {
            const convId = app.options.groupId || DataManager.getPrivateChatKey(game.user.id, app.options.otherUserId);
            DataManager.toggleFavorite(convId);
            app.render({force: true});
        });

        element.querySelector('.cyphur-mute-btn')?.addEventListener('click', (e) => {
            const convId = app.options.groupId || DataManager.getPrivateChatKey(game.user.id, app.options.otherUserId);
            DataManager.toggleMuted(convId);
            app.render({force: true});
        });

        element.querySelector('.cyphur-export-btn')?.addEventListener('click', async (e) => {
            const convId = app.options.groupId || DataManager.getPrivateChatKey(game.user.id, app.options.otherUserId);
            const content = DataManager.exportConversation(convId, !!app.options.groupId);
            const filename = `cyphur-chat-${convId}.txt`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = filename;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        });

        element.querySelector('.cyphur-background-btn')?.addEventListener('click', () => {
            const convId = app.options.groupId || DataManager.getPrivateChatKey(game.user.id, app.options.otherUserId);
            const current = (game.settings.get(MODULE_ID, 'chatBackgrounds') || {})[convId] || '';
            new FilePicker({
                type: 'image',
                current: current,
                callback: async (path) => {
                    const bgs = game.settings.get(MODULE_ID, 'chatBackgrounds') || {};
                    if (path) {
                        bgs[convId] = path;
                    } else {
                        delete bgs[convId];
                    }
                    await game.settings.set(MODULE_ID, 'chatBackgrounds', bgs);
                    CyphurWindowUI.applyBackground(element, path);
                }
            }).browse(current);
        });
        
        element.querySelectorAll('.cyphur-msg-reply').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.closest('[data-message-id]')?.dataset.messageId;
                DataManager.setReplyTo(id);
                app.render({force: true});
            });
        });

        element.querySelectorAll('.cyphur-msg-react').forEach(btn => {
            btn.addEventListener('click', (e) => e.currentTarget.closest('[data-message-id]')?.querySelector('.cyphur-emoji-picker')?.classList.toggle('visible'));
        });

        element.querySelectorAll('.cyphur-emoji-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const emoji = e.currentTarget.dataset.emoji;
                const msgId = e.currentTarget.closest('[data-message-id]')?.dataset.messageId;
                const convId = app.options.groupId || DataManager.getPrivateChatKey(game.user.id, app.options.otherUserId);
                CyphurWindowActions.toggleReaction(convId, msgId, emoji, !!app.options.groupId);
            });
        });
    }

    static _onTyping(app) {
        const now = Date.now();
        const convId = app.options.groupId || DataManager.getPrivateChatKey(game.user.id, app.options.otherUserId);
        if (now - app._lastTypingEmit > 2000) {
            app._lastTypingEmit = now;
            SocketHandler.sendTypingIndicator(convId, true, !!app.options.groupId);
        }
        clearTimeout(app._typingTimeout);
        app._typingTimeout = setTimeout(() => {
            SocketHandler.sendTypingIndicator(convId, false, !!app.options.groupId);
        }, 3000);
    }
}
