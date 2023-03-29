const electron = require('electron');
const { app, BrowserWindow, Menu, ipcMain, shell } = electron;
const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');

process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;

//Create Main Window
function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'Image Resize',
        width: isDev ? 1000: 500,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    //Open Dev Tools if it not on production
    if(isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

//Create About Window
function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        title: 'About Image Resizer',
        width: 350,
        height: 350
    });

    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

//App is Ready
app.whenReady().then(() => {
    createMainWindow();

    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length == 0) {
            createMainWindow();
        }
    });

    //Remove mainWindow from memory
    mainWindow.on('closed', () => (mainWindow = null));

    //Custom Menu Implementation
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
});

//Menu Template
const menu = [
    ...(isMac ? [
        {
            label: app.name,
            submenu: [
                {
                    label: 'About',
                    click: () => createAboutWindow(),
                }
            ]
        }
    ] : []),
    {
        /* label: 'File',
        submenu: [
            {
                label: 'Quit',
                click: () => isMac ? app.exit() : app.quit(),
                accelerator: 'CmdOrCtrl+w'
            }
        ] */
        role: 'fileMenu'
    },
    ...(!isMac ? [
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => createAboutWindow(),
                }
            ]
        }
    ] : [])
]

app.on('window-all-closed', () => {
    if(!isMac) {
        app.quit();
    }
});

//Respond to ipcrenderer resize
ipcMain.on('image:resize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageresize');
    resizeImage(options);
});

//Resize the image
async function resizeImage({imgPath, width, height, dest}) {
    try {
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height
        });

        //Create filename
        const filename = path.basename(imgPath);

        //Create dest folder if not exist
        if(!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }

        //write file to dest
        fs.writeFileSync(path.join(dest, filename), newPath);

        //Send success to renderer
        mainWindow.webContents.send('image:done');

        //open image after resize
        shell.openPath(dest);
    } catch (error) {
        console.log(error);
    }
}