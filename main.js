/**
 * RNK Cyphur
 * Copyright © 2025 Asgard Innovations / RNK™. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of RNK Cyphur.
 * Unauthorized copying, distribution, modification, or use of this file
 * is strictly prohibited and constitutes copyright infringement.
 *
 * All intellectual property rights are owned exclusively by:
 * Asgard Innovations / RNK
 *
 * For licensing inquiries: licensing@asgardinnovations.com
 *
 * @copyright 2025 Asgard Innovations / RNK
 * @license   Proprietary - All Rights Reserved
 * @trademark RNK™
 */

import { MODULE_ID } from './src/Constants.js';
import { UIManager } from './src/UIManager.js';
import { RNKCyphur } from './src/RNKCyphur.js';
import './src/hooks.js';

globalThis.RNKCyphur = RNKCyphur;

// ════════════════════════════════════════════════════════════════════════════
// CODEX REGISTRATION - Module Level (Before Hooks)
// ════════════════════════════════════════════════════════════════════════════
globalThis.RNK_MODULES = globalThis.RNK_MODULES || [];
if (!globalThis.RNK_MODULES.some(m => m.id === MODULE_ID)) {
    globalThis.RNK_MODULES.push({
        id: MODULE_ID,
        title: 'Cyphur Communications',
        icon: 'fa-solid fa-satellite-dish',
        order: 30,
        applicationClass: 'cyphur-window',
        windowSelector: '.cyphur-window, .cyphur-player-hub, #cyphur-floating-btn',
        onClick: async () => {
            try {
                UIManager.openPlayerHub();
            } catch (error) {
                console.error('Cyphur | Failed to open from Codex:', error);
                ui.notifications?.warn?.('Failed to open Cyphur');
            }
        }
    });
}

