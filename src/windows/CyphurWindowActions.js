/**
 * RNK Cyphur - Chat Window Actions
 * Engine for Chat Window message operations.
 */

import { RNKCyphur } from '../RNKCyphur.js';
import { DataManager } from '../DataManager.js';

export class CyphurWindowActions {
    static async handleMessageSubmit(app, message, speakerId, imageUrl) {
        if (!message && !imageUrl) return;
        
        let speakerData = null;
        if (speakerId && speakerId !== game.user.id) {
            const actor = game.actors.get(speakerId);
            if (actor) speakerData = { name: actor.name, img: actor.img };
        }

        const { groupId, otherUserId, actorId } = app.options;
        if (groupId) {
            await RNKCyphur.sendGroupMessage(groupId, message, speakerData, imageUrl);
        } else if (actorId) {
            await RNKCyphur.sendActorMessage(actorId, message, speakerData, imageUrl);
        } else {
            await RNKCyphur.sendMessage(otherUserId, message, speakerData, imageUrl);
        }
        
        app._pendingImage = null;
        app._preservedInputValue = '';
    }

    static async editMessage(convId, msgId, isGroup) {
        const chat = isGroup ? DataManager.groupChats.get(convId) : DataManager.getConversation(convId);
        const msg = chat?.history?.find(m => m.id === msgId);
        if (!msg) return;

        const newContent = await Dialog.prompt({
            title: game.i18n.localize('CYPHUR.EditMessage'),
            content: `<textarea style="width:100%;height:80px;">${msg.messageContent}</textarea>`,
            callback: (html) => html.find('textarea').val(),
            rejectClose: false
        });

        if (newContent) await RNKCyphur.editMessage(convId, msgId, newContent.trim(), isGroup);
    }

    static async toggleReaction(convId, msgId, emoji, isGroup) {
        await RNKCyphur.toggleReaction(convId, msgId, emoji, isGroup);
    }
}
