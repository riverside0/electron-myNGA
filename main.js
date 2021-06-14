
let electron = require("electron");
const path = require('path')
let app = electron.app;
// app.setAppUserModelId('myAppId') //设置后会丢失任务栏icon
let BrowserWindow = electron.BrowserWindow;
let Tray = electron.Tray;
let tray =null
let mainWindow = null;


app.on("ready", () => {
  tray = new Tray(path.join(__dirname, 'nga.ico'))

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences:  {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
    },
    icon: path.join(__dirname, 'nga.ico')
  });
  mainWindow.loadFile("index.html");
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});