/**
 * RNK Cyphur - Settings Registration Hook
 */
import { MODULE_ID, DEFAULTS } from '../Constants.js';

export class SettingsHook {
    static register() {
        Hooks.once('init', () => {
            // Register custom Handlebars helpers
            Handlebars.registerHelper('includes', (arr, val) => Array.isArray(arr) && arr.includes(val));

            const settings = [
                { key: 'groupChats', scope: 'world', type: Object, default: {} },
                { key: 'privateChats', scope: 'world', type: Object, default: {} },
                { key: 'unreadData', scope: 'client', type: Object, default: { counts: {}, lastRead: {} } },
                { key: 'favorites', scope: 'client', type: Array, default: [] },
                { key: 'mutedConversations', scope: 'client', type: Array, default: [] },
                { key: 'pinnedMessages', scope: 'client', type: Object, default: {} },
                { key: 'sharedBackgrounds', scope: 'world', type: Object, default: {} },
                { key: 'gmSettings', scope: 'world', type: Object, default: {} },
                { key: 'playerSettings', scope: 'client', type: Object, default: {} },
                { key: 'chatBackgrounds', scope: 'client', type: Object, default: {} },
                { key: 'gmBackgrounds', scope: 'world', type: Object, default: { global: null, perUser: {}, perChat: {} } }
            ];

            settings.forEach(s => {
                game.settings.register(MODULE_ID, s.key, {
                    name: s.key, scope: s.scope, config: false, type: s.type, default: s.default
                });
            });

            // Configurable settings
            game.settings.register(MODULE_ID, 'gmOverrideEnabled', {
                name: 'GM Audio Override', hint: 'Force a specific notification sound for all players',
                scope: 'world', config: true, type: Boolean, default: false
            });

            game.settings.register(MODULE_ID, 'gmOverrideSoundPath', {
                name: 'GM Override Sound Path', hint: 'Path to the sound file to enforce',
                scope: 'world', config: true, type: String, default: ''
            });

            game.settings.register(MODULE_ID, 'personalBackground', {
                name: 'Personal Background Image', hint: 'Custom background image URL',
                scope: 'client', config: true, type: String, default: ''
            });

            game.settings.register(MODULE_ID, 'shareBackground', {
                name: 'Share Background', hint: 'Allow others to see your custom chat background',
                scope: 'client', config: true, type: Boolean, default: false
            });

            game.settings.register(MODULE_ID, 'enableSounds', {
                name: 'Enable Sounds', scope: 'client', config: true, type: Boolean, default: DEFAULTS.enableSounds
            });

            game.settings.register(MODULE_ID, 'notificationVolume', {
                name: 'Notification Volume', scope: 'client', config: true, type: Number,
                range: { min: 0, max: 1, step: 0.01 }, default: DEFAULTS.soundVolume
            });

            game.settings.register(MODULE_ID, 'enableDesktopNotifications', {
                name: 'Enable Browser Notifications', scope: 'client', config: true, type: Boolean, default: DEFAULTS.enableDesktopNotifications
            });

            game.settings.register(MODULE_ID, 'sfxCloseWindow', {
                name: 'Close Window Sound', scope: 'client', config: true, type: String, default: DEFAULTS.sfxCloseWindow
            });

            game.settings.register(MODULE_ID, 'sfxGetMessage', {
                name: 'Incoming Message Sound', scope: 'client', config: true, type: String, default: DEFAULTS.sfxGetMessage
            });

            game.settings.register(MODULE_ID, 'sfxButtonPress', {
                name: 'Button Press Sound', scope: 'client', config: true, type: String, default: DEFAULTS.sfxButtonPress
            });

            game.settings.register(MODULE_ID, 'sfxSendMessage', {
                name: 'Send Message Sound', scope: 'client', config: true, type: String, default: DEFAULTS.sfxSendMessage
            });

            game.settings.register(MODULE_ID, 'enterToSend', {
                name: 'Enter to Send', scope: 'client', config: true, type: Boolean, default: DEFAULTS.enterToSend
            });
        });
    }
}
