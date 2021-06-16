let electron = require("electron");
electron.powerSaveBlocker.start("prevent-app-suspension");
let ipcMain = electron.ipcMain;
// const path = require("path");
let app = electron.app;
// app.setAppUserModelId('myAppId') //设置后会丢失任务栏icon
let BrowserWindow = electron.BrowserWindow;
let ipcMain = electron.ipcMain;
// let Tray = electron.Tray;
// let Menu = electron.Menu;
// let tray =null
let mainWindow = null;

ipcMain.on("notice", () => {
  const badgeString = app.dock.getBadge();
  if (!mainWindow.isVisible()) {
    app.dock.setBadge(
      badgeString ? (parseInt(badgeString) + 1).toString() : "1"
    );
  }
});
function createWindow() {}
app.on("ready", () => {
  // tray = new Tray(path.join(__dirname, "nga-mac.ico"));

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    // icon: path.join(__dirname, "nga-mac.ico"),
  });
  if (process.platform === "darwin") {
    // app.dock.setIcon(path.join(__dirname, "nga-mac.ico"));
    mainWindow.on("focus", () => {
      app.dock.setBadge("");
    });
  }
  mainWindow.loadFile("index.html");
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  // mainWindow.on("close", (event) => {
  //   mainWindow.hide();
  //   mainWindow.setSkipTaskbar(true);
  //   event.preventDefault();
  // });
  //创建系统通知区菜单
  // const contextMenu = Menu.buildFromTemplate([
  //   {
  //     label: "退出",
  //     click: () => {
  //       mainWindow.destroy();
  //     },
  //   }, //我们需要在这里有一个真正的退出（这里直接强制退出）
  // ]);
  // tray.setToolTip("nga爬虫");
  // tray.setContextMenu(contextMenu);
  // tray.on("click", () => {
  //   //我们这里模拟桌面程序点击通知区图标实现打开关闭应用的功能
  //   mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  //   mainWindow.isVisible()
  //     ? mainWindow.setSkipTaskbar(false)
  //     : mainWindow.setSkipTaskbar(true);
  // });
  ipcMain.on('stop-refresh', (event, indexStop) => {
    mainWindow.webContents.send('stop', indexStop);
  })
});
app.whenReady().then(() => {
  createWindow();
});
app.on("window-all-closed", () => {
  app.quit();
});
