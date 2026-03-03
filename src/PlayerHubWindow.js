/**
 * RNK Cyphur - Player Hub Window
 * Turbo-level component for the main module hub.
 */

import { MODULE_ID } from './Constants.js';
import { PlayerHubData } from './windows/PlayerHubData.js';
import { PlayerHubEvents } from './windows/PlayerHubEvents.js';
import { PlayerHubUtils } from './windows/PlayerHubUtils.js';
import { CyphurWindowUI } from './windows/CyphurWindowUI.js';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class PlayerHubWindow extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: 'cyphur-player-hub',
        classes: ['rnk-cyphur', 'cyphur-hub', 'cyphur-window'],
        window: { title: 'CYPHUR.Hub.Title', resizable: true, positioned: true },
        tag: 'div',
        position: { width: 700, height: 600 }
    };

    static PARTS = {
        form: { template: `modules/${MODULE_ID}/templates/player-hub.hbs` }
    };

    constructor(options = {}) {
        super(options);
        this.activeTab = 'conversations';
    }

    async _prepareContext() {
        return PlayerHubData.getHubContext(this.activeTab);
    }

    _onRender(context, options) {
        super._onRender(context, options);
        PlayerHubEvents.activateListeners(this, this.element);
        CyphurWindowUI.setupButtonImages(this.element);
        this.bringToFront();
    }

    bringToFront() {
        if (this.element) {
            this.element.style.zIndex = Math.max(100, ...Array.from(document.querySelectorAll('.window-app')).map(w => parseInt(w.style.zIndex) || 0)) + 1;
        }
    }

    // Proxy actions
    async _onExportLocal() { await PlayerHubUtils.exportLocal(); }
    async _onSetGlobalBackground() { await PlayerHubUtils.setGlobalBackground(); }

    async close(options = {}) {
        const { UIManager } = await import('./UIManager.js');
        UIManager.playerHubWindow = null;
        return super.close(options);
    }
}
