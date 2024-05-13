const { app, BrowserWindow } = require('electron');

const path  = require('path');
const { dialog } = require('electron')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      sandbox:false,
      preload: path.join(__dirname, './preloud.js')
    }
  })
  win.loadFile('index.html')
  
}

app.whenReady().then(() => {
  createWindow()
})