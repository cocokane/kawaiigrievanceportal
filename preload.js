const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendGrievance: (grievance) => ipcRenderer.invoke('send-grievance', grievance),
  // Potentially add other APIs here if needed, e.g., for config management
});
