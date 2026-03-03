/**
 * RNK Cyphur - Player Hub Utilities
 * Engine for exports and GM-specific hub actions.
 */

import { MODULE_ID } from '../Constants.js';
import { DataManager } from '../DataManager.js';

export class PlayerHubUtils {
    static async exportToJournal() {
        let content = `<h1>Cyphur Chat Export</h1><p>Exported: ${new Date().toLocaleString()}</p><hr>`;
        
        for (const chat of DataManager.privateChats.values()) {
            if (!chat.users?.includes(game.user.id)) continue;
            const other = game.users.get(chat.users.find(id => id !== game.user.id));
            content += `<h2>Chat with ${other?.name || 'Unknown'}</h2>`;
            content += this._formatExport(chat.history);
        }
        
        await JournalEntry.create({
            name: `Cyphur Export ${new Date().toLocaleDateString()}`,
            pages: [{ name: 'Chat History', type: 'text', text: { content, format: 1 } }]
        });
        ui.notifications.info('Exported to Journal');
    }

    static async exportLocal() {
        let content = `RNK Cyphur Chat Export - ${new Date().toLocaleString()}\n`;
        content += "========================================\n\n";

        for (const chat of DataManager.privateChats.values()) {
            if (!chat.users?.includes(game.user.id)) continue;
            const other = game.users.get(chat.users.find(id => id !== game.user.id));
            content += `Chat with ${other?.name || 'Unknown'}\n`;
            if (chat.history) {
                chat.history.forEach(m => {
                    const time = new Date(m.timestamp).toLocaleTimeString();
                    content += `[${time}] ${m.senderName}: ${m.messageContent}\n`;
                });
            }
            content += "\n----------------------------------------\n\n";
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `cyphur-export-${Date.now()}.txt`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        ui.notifications.info('Exported to local file');
    }

    static _formatExport(history) {
        if (!history?.length) return '<p>No messages</p>';
        let h = '<ul>';
        for (const m of history) {
            const time = new Date(m.timestamp).toLocaleTimeString();
            h += `<li>[${time}] <strong>${m.senderName}:</strong> ${m.messageContent}</li>`;
        }
        return h + '</ul>';
    }

    static async setGlobalBackground() {
        new FilePicker({
            type: 'image',
            callback: async (path) => {
                const bgs = game.settings.get(MODULE_ID, 'gmBackgrounds') || {};
                bgs.global = path;
                await game.settings.set(MODULE_ID, 'gmBackgrounds', bgs);
            }
        }).render(true);
    }
}
