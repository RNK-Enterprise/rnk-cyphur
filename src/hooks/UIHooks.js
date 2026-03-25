/**
 * RNK Cyphur - UI Interaction Hooks
 */
import { UIManager } from '../UIManager.js';
import { MODULE_ID, UI_SOUNDS } from '../Constants.js';
import { CyphurWindowUI } from '../windows/CyphurWindowUI.js';
import { Utils } from '../Utils.js';

export class UIHooks {
    static register() {
        // Apply button images to all cyphur windows on render
        Hooks.on('renderApplication', (app, html) => {
            const el = html[0] || html;
            if (el?.classList?.contains('cyphur-window') || el?.querySelector?.('.cyphur-window')) {
                CyphurWindowUI.setupButtonImages(el);
            }
        });
        Hooks.on('renderApplicationV2', (app, element) => {
            if (element?.classList?.contains('cyphur-window') || element?.querySelector?.('.cyphur-window')) {
                CyphurWindowUI.setupButtonImages(element);
            }
        });

        // FilePicker Fix (only for Cyphur windows)
        Hooks.on('renderFilePicker', (app, html) => {
            const hasCyphur = Boolean(app?.element?.closest?.('.rnk-cyphur') || app?.element?.closest?.('.cyphur-window'));
            if (!hasCyphur) return;

            const all = Array.from(document.querySelectorAll('body *'));
            let maxZ = 0;
            all.forEach(el => {
                const z = parseInt(window.getComputedStyle(el).zIndex, 10);
                if (!isNaN(z) && z > maxZ) maxZ = z;
            });

            const dlg = html.closest('.dialog');
            const target = dlg && dlg.length ? dlg[0] : html[0];
            if (!target) return;

            try { document.body.appendChild(target); } catch (e) {}
            const rect = target.getBoundingClientRect();
            const finalZ = Math.max(maxZ + 10, 9999999);
            try { $(target).css({ position: 'fixed', top: `${rect.top}px`, left: `${rect.left}px`, zIndex: finalZ }); } catch (e) { }
        });

        // Scene Controls
        Hooks.on('getSceneControlButtons', (controls) => {
            const isArray = Array.isArray(controls);
            
            const tools = [
                {
                    name: 'openHub',
                    title: 'Open Cyphur Hub',
                    icon: 'fas fa-comments',
                    button: true,
                    onClick: () => { UIManager.openPlayerHub(); }
                },
                {
                    name: 'newChat',
                    title: 'New Private Chat',
                    icon: 'fas fa-plus',
                    button: true,
                    onClick: () => { UIHooks._showNewChatDialog(); }
                }
            ];

            if (game.user.isGM) {
                tools.push(
                    {
                        name: 'gmMonitor',
                        title: 'GM Monitor',
                        icon: 'fas fa-eye',
                        button: true,
                        onClick: () => { UIManager.openGMMonitor(); }
                    },
                    {
                        name: 'gmMod',
                        title: 'GM Moderation',
                        icon: 'fas fa-shield-alt',
                        button: true,
                        onClick: () => { UIManager.openGMModWindow(); }
                    }
                );
            }

            const cyphurControl = {
                name: 'cyphur',
                title: 'Cyphur Communications',
                icon: 'fas fa-satellite-dish',
                visible: true,
                layer: 'tokens',
                tools: isArray ? tools : tools.reduce((acc, t) => { acc[t.name] = t; return acc; }, {})
            };

            if (isArray) {
                controls.push(cyphurControl);
            } else {
                controls.cyphur = cyphurControl;
            }
        });

        // Update Badge
        Hooks.on('updateSetting', (setting) => {
            if (setting.key === `${MODULE_ID}.unreadData`) UIHooks._updateHotbarBadge();
        });
    }

    static _showNewChatDialog() {
        const users = game.users.filter(u => u.id !== game.user.id);
        if (users.length === 0) {
            ui.notifications.warn('No other users were found in this world.');
            return;
        }
        
        new Dialog({
            title: 'New Private Chat',
            content: `
                <div class="form-group">
                    <label>Select User</label>
                    <select id="cyphur-user-select" style="width:100%; margin: 10px 0;">
                        ${users.map(u => `<option value="${u.id}">${u.name}${u.active ? ' (Online)' : ''}</option>`).join('')}
                    </select>
                </div>
            `,
            buttons: {
                start: {
                    icon: '<i class="fas fa-comments"></i>',
                    label: 'Start Chat',
                    callback: (html) => {
                        const userId = html.find('#cyphur-user-select').val();
                        if (userId) UIManager.openChatFor(userId);
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancel'
                }
            },
            default: "start"
        }, {
            width: 300,
            classes: ["cyphur-dialog", "dark"]
        }).render(true);
    }

    static _updateHotbarBadge() {
        import('../DataManager.js').then(({ DataManager }) => {
            const total = DataManager.getTotalUnread();
            const badge = document.querySelector('.cyphur-hotbar-badge');
            if (badge) {
                badge.textContent = total > 99 ? '99+' : total;
                badge.style.display = total > 0 ? 'flex' : 'none';
            }
        });
    }
}
