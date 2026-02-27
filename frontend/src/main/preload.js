/**
 * Electron Preload Script
 * 
 * Exposes safe APIs to the renderer process via contextBridge.
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
    // API configuration
    getApiUrl: () => ipcRenderer.invoke('get-api-url'),
    getVersion: () => ipcRenderer.invoke('get-version'),

    // Store operations
    store: {
        get: (key) => ipcRenderer.invoke('store-get', key),
        set: (key, value) => ipcRenderer.invoke('store-set', key, value),
        delete: (key) => ipcRenderer.invoke('store-delete', key)
    },

    // Theme operations
    theme: {
        get: () => ipcRenderer.invoke('get-theme'),
        set: (theme) => ipcRenderer.invoke('set-theme', theme)
    },

    // Print operations
    print: {
        receipt: (content) => ipcRenderer.invoke('print-receipt', content),
        pdf: (content) => ipcRenderer.invoke('generate-pdf', content)
    },

    // Platform info
    platform: process.platform,

    // App info
    isElectron: true
});
