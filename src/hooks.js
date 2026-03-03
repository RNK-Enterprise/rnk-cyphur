/**
 * RNK Cyphur - Hooks System (Registration Entry)
 */
import { SettingsHook } from "./hooks/SettingsHook.js";
import { ReadyHook } from "./hooks/ReadyHook.js";
import { UIHooks } from "./hooks/UIHooks.js";

// Initialize all hook divisions
SettingsHook.register();
ReadyHook.register();
UIHooks.register();
