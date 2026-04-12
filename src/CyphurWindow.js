/**
 * RNK Cyphur - Chat Window
 * Turbo-level component for primary messaging interfaces.
 */

import { CyphurWindowData } from './windows/CyphurWindowData.js';
import { CyphurWindowEvents } from './windows/CyphurWindowEvents.js';
import { CyphurWindowUI } from './windows/CyphurWindowUI.js';
import { CyphurWindowActions } from './windows/CyphurWindowActions.js';
import { DataManager } from './DataManager.js';
import { Utils } from './Utils.js';
import { UI_SOUNDS } from './Constants.js';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class CyphurWindow extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        classes: ['rnk-cyphur', 'cyphur-chat-window'],
        position: { width: 420, height: 500 },
        window: { resizable: true },
        popOut: false,
        tag: 'form',
        form: { closeOnSubmit: false }
    };

    static PARTS = {
        form: { template: 'modules/rnk-cyphur/templates/chat-window.hbs' }
    };

    constructor(options = {}) {
        super(options);
        this._preservedInputValue = '';
        this._lastTypingEmit = 0;
        this._typingTimeout = null;
        this._searchQuery = '';
        this._pendingImage = null;
    }

    async _prepareContext() {
        return CyphurWindowData.getChatContext(this);
    }

    _onRender(context, options) {
        super._onRender(context, options);
        CyphurWindowEvents.activateListeners(this, this.element);
        CyphurWindowUI.setupButtonImages(this.element);
        CyphurWindowUI.scrollToBottom(this.element);
        
        const convId = this.options.groupId
            || this.options.actorId
                ? (this.options.groupId || DataManager.getActorChatKey(this.options.actorId))
                : DataManager.getPrivateChatKey(game.user.id, this.options.otherUserId);
        const bg = DataManager.getEffectiveBackground(convId, game.user.id);
        CyphurWindowUI.applyBackground(this.element, bg);
        CyphurWindowUI.updateImagePreview(this.element, this._pendingImage);
    }

    async _handleFormSubmit() {
        const textarea = this.element.querySelector('textarea[name="message"]');
        const speaker = this.element.querySelector('select[name="speaker"]');
        const message = textarea?.value?.trim();
        const speakerId = speaker?.value;
        
        if (!message && !this._pendingImage) return;

        // Play send message sound
        Utils.playUISound(UI_SOUNDS.sendMessage);

        // Force a re-render AFTER setting state so context is fresh
        const currentImage = this._pendingImage;
        this._pendingImage = null;
        this._preservedInputValue = '';
        if (textarea) textarea.value = '';

        await CyphurWindowActions.handleMessageSubmit(this, message, speakerId, currentImage);
        
        // Use a slight delay to ensure the data layer has finished its work
        setTimeout(() => this.render(true), 100);
    }

    async _onImageSelected(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const result = await DataManager.processImage(file);
        if (result) {
            this._pendingImage = result;
            CyphurWindowUI.updateImagePreview(this.element, result);
        }
    }
}
