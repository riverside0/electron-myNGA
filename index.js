let electron = require("electron");

let app = electron.app;
app.setAppUserModelId('myAppId')
let BrowserWindow = electron.BrowserWindow;

let mainWindow = null;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences:  {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
    },
  });
  mainWindow.loadFile("index.html");
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});
