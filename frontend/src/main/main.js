/**
 * Electron Main Process
 * 
 * Main entry point for the Electron application.
 * Handles window creation, IPC, and app lifecycle.
 */

const { app, BrowserWindow, ipcMain, Menu, Tray, nativeTheme } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Initialize electron-store for persistent settings
const store = new Store();

// Keep a global reference of the window object
let mainWindow = null;
let tray = null;

// Check if running in development
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// API URL based on environment
const API_URL = isDev
    ? 'http://localhost:5000/api'
    : 'https://api.yourdomain.com/api';

/**
 * Create the main application window
 */
function createWindow() {
    // Get window state from store
    const windowState = store.get('windowState', {
        width: 1400,
        height: 900,
        x: undefined,
        y: undefined,
        isMaximized: false
    });

    // Create the browser window
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
        icon: path.join(__dirname, '../../public/icons/icon.png'),
        title: 'POS System',
        show: false, // Don't show until ready
        backgroundColor: '#1f2937' // Match dark theme
    });

    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        // Open DevTools in development
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
    }

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        if (windowState.isMaximized) {
            mainWindow.maximize();
        }
        mainWindow.show();
    });

    // Save window state on close
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

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Create application menu
    createMenu();
}

/**
 * Create application menu
 */
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
                        // Show about dialog
                    }
                }
            ]
        }
    ];

    // Add developer tools menu in development
    if (isDev) {
        template[2].submenu.push(
            { type: 'separator' },
            { role: 'toggleDevTools' }
        );
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

/**
 * Create system tray icon
 */
function createTray() {
    tray = new Tray(path.join(__dirname, '../../public/icons/icon.png'));

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open POS System', click: () => mainWindow.show() },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() }
    ]);

    tray.setToolTip('POS System');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
        mainWindow.show();
    });
}

// App ready event
app.whenReady().then(() => {
    createWindow();
    createTray();

    // On macOS, recreate window when dock icon is clicked
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers

// Get API URL
ipcMain.handle('get-api-url', () => API_URL);

// Get app version
ipcMain.handle('get-version', () => app.getVersion());

// Store operations
ipcMain.handle('store-get', (event, key) => store.get(key));
ipcMain.handle('store-set', (event, key, value) => store.set(key, value));
ipcMain.handle('store-delete', (event, key) => store.delete(key));

// Theme operations
ipcMain.handle('get-theme', () => {
    return store.get('theme', 'light');
});

ipcMain.handle('set-theme', (event, theme) => {
    store.set('theme', theme);
    nativeTheme.themeSource = theme;
    return theme;
});

// Print receipt
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

// Generate PDF
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

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
    });
});
