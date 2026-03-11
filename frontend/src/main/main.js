const { app, BrowserWindow, ipcMain, Menu, Tray, nativeTheme } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let mainWindow = null;
let tray = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

const API_URL = isDev
    ? 'http://localhost:5000/api'
    : 'https://api.yourdomain.com/api';

function createWindow() {
    const windowState = store.get('windowState', {
        width: 1400,
        height: 900,
        x: undefined,
        y: undefined,
        isMaximized: false
    });

    mainWindow = new BrowserWindow({
        width: windowState.width,
        height: windowState.height,
        x: windowState.x,
        y: windowState.y,
        minWidth: 1024,
        minHeight: 768,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        title: 'POS System',
        show: false,
        backgroundColor: '#1f2937'
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        if (windowState.isMaximized) {
            mainWindow.maximize();
        }
        mainWindow.show();
    });

    mainWindow.on('close', () => {
        const bounds = mainWindow.getBounds();
        store.set('windowState', {
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
            isMaximized: mainWindow.isMaximized()
        });
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    createMenu();
}

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About POS System',
                    click: () => {
                    }
                }
            ]
        }
    ];

    if (isDev) {
        template[2].submenu.push(
            { type: 'separator' },
            { role: 'toggleDevTools' }
        );
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

function createTray() {
    // Tray icon disabled - no icon file available
    tray = null;
}

app.whenReady().then(() => {
    createWindow();
    createTray();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('get-api-url', () => API_URL);
ipcMain.handle('get-version', () => app.getVersion());

ipcMain.handle('store-get', (event, key) => store.get(key));
ipcMain.handle('store-set', (event, key, value) => store.set(key, value));
ipcMain.handle('store-delete', (event, key) => store.delete(key));

ipcMain.handle('get-theme', () => {
    return store.get('theme', 'light');
});

ipcMain.handle('set-theme', (event, theme) => {
    store.set('theme', theme);
    nativeTheme.themeSource = theme;
    return theme;
});

ipcMain.handle('print-receipt', async (event, content) => {
    const printWindow = new BrowserWindow({
        width: 300,
        height: 500,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(content)}`);

    return new Promise((resolve, reject) => {
        printWindow.webContents.on('did-finish-load', () => {
            printWindow.webContents.print({}, (success, errorType) => {
                if (success) {
                    resolve(true);
                } else {
                    reject(new Error(errorType));
                }
                printWindow.close();
            });
        });
    });
});

ipcMain.handle('generate-pdf', async (event, content) => {
    const pdfWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(content)}`);

    return new Promise((resolve, reject) => {
        pdfWindow.webContents.on('did-finish-load', async () => {
            try {
                const pdf = await pdfWindow.webContents.printToPDF({});
                pdfWindow.close();
                resolve(pdf);
            } catch (error) {
                reject(error);
                pdfWindow.close();
            }
        });
    });
});

app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
    });
});
