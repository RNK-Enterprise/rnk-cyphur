/**
 * RNK Cyphur - Chat Window UI
 * Engine for Chat Window UI manipulation (backgrounds, scrolling, typing).
 */

import { Utils } from '../Utils.js';
import { UI_SOUNDS } from '../Constants.js';

export class CyphurWindowUI {
    static applyBackground(element, path) {
        const container = element?.querySelector('.cyphur-chat-container');
        if (!container) return;
        const overlay = 'linear-gradient(rgba(0, 10, 20, 0.75), rgba(0, 10, 20, 0.85))';
        if (path) {
            container.style.backgroundImage = `${overlay}, url('${path}')`;
            container.style.backgroundSize = 'cover';
            container.style.backgroundPosition = 'center';
            container.classList.add('has-background');
        } else {
            container.style.backgroundImage = '';
            container.classList.remove('has-background');
        }
    }

    static scrollToBottom(element, smooth = true) {
        const list = element?.querySelector('.cyphur-message-list');
        if (list) {
            requestAnimationFrame(() => {
                list.scrollTo({ top: list.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
            });
        }
    }

    static updateImagePreview(element, pendingImage) {
        const preview = element?.querySelector('.cyphur-image-preview');
        if (!preview) return;
        if (pendingImage) {
            preview.innerHTML = `
                <div class="cyphur-pending-image">
                    <img src="${pendingImage}">
                    <button type="button" class="cyphur-cancel-image"><i class="fas fa-times"></i></button>
                </div>`;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    }

    static updateTyping(element, text) {
        const el = element?.querySelector('.cyphur-typing-indicator');
        if (!el) return;
        if (text) {
            el.style.display = '';
            el.innerHTML = `<i class="fas fa-ellipsis-h"></i> ${Utils.sanitizeHTML(text)}`;
        } else {
            el.style.display = 'none';
        }
    }

    /**
     * Set up image-based buttons: close button replacement + pressed state image swaps.
     * Call from _onRender on any cyphur window.
     */
    static setupButtonImages(windowElement) {
        if (!windowElement) return;

        // Force white border on the window element
        windowElement.style.border = '2px solid #ffffff';
        windowElement.style.outline = 'none';

        // Replace close button icon with No.png image
        const allCloseBtns = Array.from(windowElement.querySelectorAll(
            '.header-control.close, .header-button.close, button[data-action="close"], button.close'
        ));
        let closeBtnReplaced = false;
        for (const btn of allCloseBtns) {
            if (!closeBtnReplaced) {
                btn.innerHTML = '<img class="btn-icon close-icon" src="modules/rnk-cyphur/icons/No.png" data-default="modules/rnk-cyphur/icons/No.png" data-active="modules/rnk-cyphur/icons/No_on.png" alt="Close">';
                btn.classList.add('cyphur-close-btn');
                const img = btn.querySelector('img');
                btn.addEventListener('mousedown', () => {
                    if (img) img.src = img.dataset.active;
                    Utils.playUISound(UI_SOUNDS.closeWindow);
                });
                btn.addEventListener('mouseup', () => {
                    if (img) img.src = img.dataset.default;
                });
                btn.addEventListener('mouseleave', () => {
                    if (img) img.src = img.dataset.default;
                });
                btn._btnImgSetup = true;
                closeBtnReplaced = true;
            } else {
                btn.style.display = 'none';
            }
        }

        // Broad sweep: hide any remaining header buttons/controls that are not our custom close button
        const allHeaderControls = windowElement.querySelectorAll(
            '.window-header button, .window-header a.header-button, .window-header .header-control'
        );
        for (const el of allHeaderControls) {
            if (!el.classList.contains('cyphur-close-btn')) {
                el.style.display = 'none';
            }
        }

        // Set up pressed state image swaps for all buttons with data-default/data-active images
        const allBtnImages = windowElement.querySelectorAll('img[data-default][data-active]');
        for (const img of allBtnImages) {
            const btn = img.closest('button');
            if (!btn || btn._btnImgSetup) continue;
            btn._btnImgSetup = true;

            btn.addEventListener('mousedown', () => {
                img.src = img.dataset.active;
                // Play button press sound (skip for send/close which have their own sounds)
                if (!btn.classList.contains('cyphur-send-btn') && !btn.classList.contains('close') && !btn.dataset.action?.includes('close')) {
                    Utils.playUISound(UI_SOUNDS.buttonPress);
                }
            });
            btn.addEventListener('mouseup', () => {
                img.src = img.dataset.default;
            });
            btn.addEventListener('mouseleave', () => {
                img.src = img.dataset.default;
            });
        }

        // For tab buttons, swap active tab image
        const tabs = windowElement.querySelectorAll('.cyphur-tab');
        for (const tab of tabs) {
            const img = tab.querySelector('img[data-default][data-active]');
            if (!img) continue;
            if (tab.classList.contains('active')) {
                img.src = img.dataset.active;
            } else {
                img.src = img.dataset.default;
            }
        }

        // Play button press sound for generic grey buttons (cyphur-btn)
        const greyButtons = windowElement.querySelectorAll('.cyphur-btn, .cyphur-btn-icon');
        for (const btn of greyButtons) {
            if (btn._cyphurGreySoundAttached) continue;
            btn._cyphurGreySoundAttached = true;
            btn.addEventListener('click', () => {
                if (btn.classList.contains('cyphur-send-btn') || btn.classList.contains('cyphur-close-btn')) return;
                Utils.playUISound('buttonPress');
            });
        }
    }
}
