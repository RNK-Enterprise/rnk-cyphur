/**
 * RNK Cyphur - Shared Constants
 * Central location for module configuration and constants
 */

export const MODULE_ID = 'rnk-cyphur';
export const MODULE_NAME = 'RNK Cyphur';
export const SOCKET_NAME = `module.${MODULE_ID}`;

// Socket event types
export const SOCKET_EVENTS = {
    PRIVATE_MESSAGE: 'privateMessage',
    GROUP_MESSAGE: 'groupMessage',
    CHANNEL_MESSAGE: 'channelMessage',
    TYPING: 'typing',
    EDIT_MESSAGE: 'editMessage',
    DELETE_MESSAGE: 'deleteMessage',
    ADD_REACTION: 'addReaction',
    GROUP_CREATE: 'groupCreate',
    GROUP_UPDATE: 'groupUpdate',
    GROUP_DELETE: 'groupDelete',
    GROUP_SYNC: 'groupSync',
    PRIVATE_SYNC: 'privateSync',
    BACKGROUND_SHARE: 'backgroundShare',
    PRESENCE_UPDATE: 'presenceUpdate',
    MESSAGE_READ: 'messageRead',
    CHANNEL_INVITE: 'channelInvite',
    IMAGE_SHARE: 'imageShare',
    GM_INTERCEPT: 'gmIntercept'
};

// Message types for different content
export const MESSAGE_TYPES = {
    TEXT: 'text',
    SYSTEM: 'system',
    DICE: 'dice',
    ITEM_LINK: 'itemLink',
    ACTOR_LINK: 'actorLink',
    IMAGE: 'image',
    FILE: 'file'
};

// Default settings values
export const DEFAULTS = {
    enableSounds: true,
    soundVolume: 0.5,
    enableDesktopNotifications: true,
    enterToSend: true,
    shareBackground: false,
    showAvatars: true,
    compactMode: false,
    maxMessageHistory: 500,
    typingTimeout: 5000,
    maxIntercepted: 1000
};

// UI Sound effects (fixed, not user-selectable)
export const UI_SOUNDS = {
    closeWindow:  'Closes a window.wav',
    getMessage:   'gets a message.wav',
    buttonPress:  'presses a button.wav',
    sendMessage:  'sending or recieving a message.wav'
};

// Reaction emoji presets
export const REACTION_EMOJIS = [];

// Status indicators
export const STATUS = {
    ONLINE: 'online',
    AWAY: 'away',
    BUSY: 'busy',
    OFFLINE: 'offline'
};

// Supported image types for upload
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

