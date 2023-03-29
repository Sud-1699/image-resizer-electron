const electron = require('electron');
const { app, contextBridge, ipcRenderer } = electron; 
const Toastify = require('toastify-js');
const os = require('os');
const path = require('path');

contextBridge.exposeInMainWorld('os', {
    homedir: () => os.homedir(),
});

contextBridge.exposeInMainWorld('path', {
    join: (...agrs) => path.join(...agrs),
});

contextBridge.exposeInMainWorld('toastify', {
    toast: (options) => Toastify(options).showToast(),
});

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...agrs) => func(...agrs)),
})