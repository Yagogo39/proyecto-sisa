const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const fs = require('fs')

let mainWindow
let backendProcess

const isDev = !app.isPackaged

function getDataPath() {
  const userData = app.getPath('userData')
  if (!fs.existsSync(userData)) {
    fs.mkdirSync(userData, { recursive: true })
  }
  return userData
}

function copiarSchemaSiHaceFalta() {
  const dataPath = getDataPath()
  const destSchema = path.join(dataPath, 'schema.sql')
  const origenSchema = path.join(process.resourcesPath, 'schema.sql')

  if (!fs.existsSync(destSchema) && fs.existsSync(origenSchema)) {
    fs.copyFileSync(origenSchema, destSchema)
  }
}

function arrancarBackend() {
  if (isDev) {
    console.log('Modo dev: asume backend corriendo en localhost:3000')
    return
  }

  const backendExe = path.join(process.resourcesPath, 'backend.exe')

  if (!fs.existsSync(backendExe)) {
    dialog.showErrorBox(
      'Error al iniciar',
      `No se encontro el backend en: ${backendExe}\n\nReinstala la aplicacion.`
    )
    return
  }

  copiarSchemaSiHaceFalta()
  const dataPath = getDataPath()

  backendProcess = spawn(backendExe, [], {
    cwd: dataPath,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      DB_PATH: path.join(dataPath, 'sistema_cyber.db')
    },
    windowsHide: true
  })

  backendProcess.stdout.on('data', (data) => {
    console.log('BACKEND:', data.toString())
  })

  backendProcess.stderr.on('data', (data) => {
    console.error('BACKEND ERROR:', data.toString())
  })

  backendProcess.on('error', (err) => {
    dialog.showErrorBox('Error al iniciar', `No se pudo iniciar el backend:\n${err.message}`)
  })
}

function crearVentana() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    icon: path.join(__dirname, 'public', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    title: 'SIS-A · Papeleria Don Max',
    autoHideMenuBar: true,
    show: false
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  arrancarBackend()
  setTimeout(crearVentana, isDev ? 0 : 3000)
})

app.on('window-all-closed', () => {
  if (backendProcess) {
    try { backendProcess.kill() } catch (e) {}
  }
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  if (backendProcess) {
    try { backendProcess.kill() } catch (e) {}
  }
})