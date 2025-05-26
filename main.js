const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Optional: const keytar = require('keytar');
const SERVICE_NAME = 'CuteGrievancePortal';

let mainWindow;
let config = {};

function loadConfig() {
  try {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } else {
        // Fallback to config.json in app directory if not in userData (e.g. first run, portable mode)
        const localConfigPath = path.join(__dirname, 'config.json');
        if (fs.existsSync(localConfigPath)) {
            config = JSON.parse(fs.readFileSync(localConfigPath, 'utf-8'));
            // Optionally copy to userData for future use
            // fs.copyFileSync(localConfigPath, configPath);
        } else {
            dialog.showErrorBox('Config Error', 'config.json not found. Please create it with your BOT_TOKEN and CHAT_ID.');
            app.quit();
            return false;
        }
    }
    if (!config.BOT_TOKEN || !config.CHAT_ID) {
        dialog.showErrorBox('Config Error', 'BOT_TOKEN and CHAT_ID must be set in config.json.');
        app.quit();
        return false;
    }
    return true;
  } catch (error) {
    dialog.showErrorBox('Config Load Error', `Failed to load config.json: ${error.message}`);
    app.quit();
    return false;
  }
  /* TODO: Replace with keytar for secure storage
  async function loadCredentials() {
    try {
      const token = await keytar.getPassword(SERVICE_NAME, 'BOT_TOKEN');
      const chatId = await keytar.getPassword(SERVICE_NAME, 'CHAT_ID');
      if (token && chatId) {
        config.BOT_TOKEN = token;
        config.CHAT_ID = chatId;
        return true;
      } else {
        // Prompt user to enter credentials if not found, then save with keytar
        // This part would require a separate settings window/flow
        dialog.showErrorBox('Credentials Error', 'BOT_TOKEN and CHAT_ID not found in keychain.');
        app.quit();
        return false;
      }
    } catch (error) {
      dialog.showErrorBox('Keychain Error', `Failed to load credentials from keychain: ${error.message}`);
      app.quit();
      return false;
    }
  }
  // Call loadCredentials() instead of direct file read
  */
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: false, // sandbox must be false if nodeIntegration is false and you are using a preload script to expose specific Node.js APIs
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');

  // mainWindow.webContents.openDevTools(); // Optional: for debugging

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', () => {
  if (loadConfig()) {
    createWindow();
  }
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') { 
    app.quit(); // Quit the app when all windows are closed except on macOS
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    if (loadConfig()) {
        createWindow(); // Recreate the window if it was closed, macOS specific behavior
    }
  }
});

ipcMain.handle('send-grievance', async (event, { senderName, text, mood, importance, imagePath }) => {
  if (!config.BOT_TOKEN || !config.CHAT_ID) {
    return { ok: false, error: 'BOT_TOKEN or CHAT_ID not configured.' };
  }

  const TELEGRAM_API_BASE = `https://api.telegram.org/bot${config.BOT_TOKEN}`;
  const messageText = 
    `💌 *${senderName}*: 
  Mood: ${mood} 
  Importance: ${importance}/10
  ${text}`;

  try {
    let response;
    if (imagePath) {
      const endpoint = `${TELEGRAM_API_BASE}/sendPhoto`;
      const FormData = require('form-data'); // node-fetch v3 needs form-data for multipart
      const form = new FormData();
      form.append('chat_id', config.CHAT_ID);
      form.append('photo', fs.createReadStream(imagePath));
      form.append('caption', messageText);
      form.append('parse_mode', 'Markdown');
      // Optional: Add inline keyboard for ACK
      // form.append('reply_markup', JSON.stringify({
      //   inline_keyboard: [[{ text: "Acknowledge ✅", callback_data: `ack_${Date.now()}` }]]
      // }));

      response = await fetch(endpoint, { method: 'POST', body: form });
    } else {
      const endpoint = `${TELEGRAM_API_BASE}/sendMessage`;
      const params = new URLSearchParams();
      params.append('chat_id', config.CHAT_ID);
      params.append('text', messageText);
      params.append('parse_mode', 'Markdown');
      // Optional: Add inline keyboard for ACK
      // params.append('reply_markup', JSON.stringify({
      //   inline_keyboard: [[{ text: "Acknowledge ✅", callback_data: `ack_${Date.now()}` }]]
      // }));

      response = await fetch(endpoint, { method: 'POST', body: params });
    }

    const result = await response.json();
    if (result.ok) {
      return { ok: true };
    } else {
      return { ok: false, error: result.description || 'Unknown error from Telegram' };
    }
  } catch (error) {
    console.error('Telegram send error:', error);
    return { ok: false, error: error.message };
  }
});

// Handle main window reloads for renderer changes during development
// This is a common pattern but be careful in production if not needed.
app.on('web-contents-created', (event, contents) => {
    if (contents.getType() === 'renderer') {
        contents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
            if (isMainFrame && validatedURL === mainWindow.webContents.getURL()) {
                console.log(`Renderer process failed to load, attempting reload: ${errorDescription}`);
                setTimeout(() => {
                    if (mainWindow && !mainWindow.isDestroyed()) {
                        mainWindow.webContents.reloadIgnoringCache();
                    }
                }, 1000);
            }
        });
    }
});
