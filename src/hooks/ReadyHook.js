/**
 * RNK Cyphur - Ready Hook Logic
 */
import { RNKCyphur } from '../RNKCyphur.js';
import { MODULE_ID } from '../Constants.js';

export class ReadyHook {
    static register() {
        Hooks.once('ready', async () => {
            try {
                await RNKCyphur.initialize();
            } catch (error) {
                console.error('Cyphur | Error initializing:', error);
            }

            // Store personal background
            try {
                const bg = game.settings.get(MODULE_ID, 'personalBackground');
                if (bg) window.RNKCyphurPersonalBackground = bg;
            } catch (error) {
                console.error('Cyphur | Error loading background:', error);
            }

            // Refresh scene controls
            setTimeout(() => {
                if (ui.controls) ui.controls.render(true);
            }, 1000);
        });
    }
}
