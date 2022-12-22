// modules

const { shell, app, remote, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
let configPath = path.join(__dirname, "../appconfig.json")
let config = JSON.parse(fs.readFileSync(configPath));
const spawnObj = require('child_process').spawn;
const os = require ('os');
const {exec, spawn} = require('child_process')

// variables

const javaVer = document.querySelector("[data-javaVer]");
let option, serverOption, wrongCounter = 0, serverDirectoryContent = "", driveLetter = "c";
const username = os.userInfo().username;
// create necessary files and directories

if (!fs.existsSync('./server/')){
  fs.mkdirSync('./server/');
}

// check if ignore.txt file still exists

if(fs.existsSync('./src/ignore.txt')){
  document.querySelector('#main').setAttribute('hidden', '');
  document.querySelector('.first-page').removeAttribute('hidden')
}

// =======
// Welcome page
// =======

// define path to ngrok config file
const ngrokymlPath = `${driveLetter}:/Users/${username}/Appdata/Local/ngrok/*.yml`

// read this directory
glob(ngrokymlPath, {}, (err, ngrokYaml)=>{
  if(ngrokYaml.length==0){
    // enable checkbox if file exists
    document.querySelector('[data-ngrok]').setAttribute('disabled', '')
    document.querySelector('[data-ngrok]').removeAttribute('checked')
  }
  else{
    // if file doesn't exist then disable ngrok checkbox
    document.querySelector('[data-ngrok]').removeAttribute('disabled')
  }
});

document.querySelector('[data-welcome-letsgo]').addEventListener('click', ()=>{
  document.querySelector('.first-page').setAttribute('hidden', '');
  document.querySelector('.second-page').removeAttribute('hidden');
})

document.querySelector('[data-welcome-openServer]').addEventListener('click', ()=>{
  shell.openPath(path.join(__dirname, '../server/'))
})

exec('wmic logicaldisk get name', (error, stdout, stderr) => {
  const drives = stdout.match(/[A-Z]:/g)
  for(var i = 0; i<drives.length; i++){
    document.querySelector('[data-welcome-drives]').innerHTML+=`<option value="${drives[i]}">${drives[i]}</option>`
  }
})

document.querySelector('[data-welcome-done]').addEventListener('click', ()=>{
  driveLetter = document.querySelector('[data-welcome-drives]').value;
  document.querySelector('.second-page').setAttribute('hidden', '')
  document.querySelector('#main').removeAttribute('hidden')
  fs.rmSync('./src/ignore.txt')

  const save = {
    driveLetter: driveLetter
  };
  let settings_data = JSON.stringify(save, null, 2);
  fs.writeFileSync("appconfig.json", save);
})


// =======
// Main app
// =======


// load settings button
document.querySelector("[data-load]").addEventListener('click', () => {
  document.querySelector('[data-javaVer]').value = config.java;
  document.querySelector('[data-serverFile]').value = config.server;
  document.querySelector('[data-min]').value = config.ramMin;
  document.querySelector('[data-max]').value = config.ramMax;
  ngrokState = config.ngrokState;
  gui = config.gui;
  if(ngrokState){
    document.querySelector('[data-ngrok]').setAttribute('checked', '');
  }
  if(gui == ''){
    document.querySelector('[data-gui]').setAttribute('checked', '');
  }
})
let ramMinSel = "-Xms"+document.querySelector('[data-min]').value+"G";
let ramMaxSel = "-Xmx"+document.querySelector('[data-max]').value+"G";
// check for java
fs.readdir('C:/Progra~1/Java', (err, files) => {
  if (files.length == 0) {
    document.querySelector('[data-javaVer]').innerHTML = '<option>Java not found</option>';
    document.querySelector('[data-javaVer]').setAttribute('disabled', '');
    wrongCounter++;
  }
  else{
    for(var i = 0; i<files.length;i++){
      option+= '<option value="'+files[i]+'">'+files[i]+'</option>';
    }
    javaVer.innerHTML = option
  }
});
// read server directory
glob('./server/*.jar', {}, (err, serverFiles)=>{
  if(serverFiles.length==0){
    document.querySelector('[data-serverFile]').innerHTML = '<option>Server .jar file not found</option>';
    document.querySelector('[data-serverFile]').setAttribute('disabled', '');
    wrongCounter++
  }
  else{
    for(var i = 0; i<serverFiles.length;i++){
      serverFiles[i] = serverFiles[i].replace('./server/', '')
      serverOption+= '<option value="'+serverFiles[i]+'">'+serverFiles[i]+'</option>';
      document.querySelector('[data-serverFile]').innerHTML = serverOption
    }
  }
});
// start btn
document.querySelector("[data-bs-start]").addEventListener('click', () => {
  // check if something's wrong
  if(wrongCounter == 0){
    // get selected java and server
    const selectedJava = document.querySelector('[data-javaVer]').value;
    const selectedServer = path.join(__dirname, ("..\\server\\"+document.querySelector('[data-serverFile]').value));

    // define java directory
    // TODO: ask for default drive letter
    const javaDir = 'C:\\Progra~1\\Java\\'+selectedJava+'\\bin\\java.exe'
    let command = `${javaDir} ${ramMinSel} ${ramMaxSel} -jar ${selectedServer} ${gui}`;
    let batch = `start "Server" /D "${(path.join(__dirname,'../server/'))}" server.bat`
    // save settings if remember is checked
    if(document.querySelector('[data-remember]').checked){
      let configsettings = {
        java: document.querySelector('[data-javaVer]').value,
        server: document.querySelector('[data-serverFile]').value,
        ramMin: document.querySelector('[data-min]').value,
        ramMax: document.querySelector('[data-max]').value,
        ngrokState: ngrokState,
        gui: gui,
        driveLetter: driveLetter
      };
      let settings_data = JSON.stringify(configsettings, null, 2);
      fs.writeFileSync("appconfig.json", settings_data);
    }

    

    
    // if ngrok is on, open bat
    if(ngrokState == true){
      shell.openPath(path.join(__dirname+"../batches/ngrok.bat"))
    }

    // write some batches
    fs.writeFileSync(path.join(__dirname, '../server/server.bat'), command, 'utf-8');
    fs.writeFileSync(path.join(__dirname, '../batches/start.bat'), batch, 'utf-8');
    fs.writeFileSync(path.join(__dirname, '../server/eula.txt'), 'eula = true', 'utf-8');
    
    // execute batch and start
    exec(path.join(__dirname, '../batches/start.bat'))
  }else{
    console.warn("Something's wrong, check your selections once again.");
  }
});
// stop button
document.querySelector('[data-stop]').addEventListener('click', ()=>{
  fs.writeFileSync('../batches/stop.bat', "taskkill /f /im java.exe", 'utf-8');
  shell.openPath(__dirname+'..\\batches\\stop.bat');
})

// advanced settings
document.querySelector('[data-advanced]').addEventListener('change', (event) =>{
  if(event.currentTarget.checked){
    document.querySelector('[data-advancedSection]').removeAttribute('hidden');
  }else{
    document.querySelector('[data-advancedSection]').setAttribute('hidden', '');
  }
})
// conversion to gb/mb
document.querySelectorAll("input[name='gb-mb']").forEach((input) => {
  input.addEventListener('change', ()=>{
    if(input.value==1){
      document.querySelector('[data-min]').value = document.querySelector('[data-min]').value*1024;
      document.querySelector('[data-max]').value = document.querySelector('[data-max]').value*1024;
      ramMinSel = "-Xms"+document.querySelector('[data-min]').value+"M";
      ramMaxSel = "-Xmx"+document.querySelector('[data-max]').value+"M";
    }else{
      document.querySelector('[data-min]').value = document.querySelector('[data-min]').value/1024;
      document.querySelector('[data-max]').value = document.querySelector('[data-max]').value/1024;
      ramMinSel = "-Xms"+document.querySelector('[data-min]').value+"G";
      ramMaxSel = "-Xmx"+document.querySelector('[data-max]').value+"G";
    }
  });
});
// nogui default
let gui = '-nogui';

// if checked then enable gui, else disable it
document.querySelector("[data-gui]").addEventListener('change', (event)=>{
  if(event.currentTarget.checked){
    gui = '';
  }else{
    gui = '-nogui'
  }
})

// if checked then enable ngrok, else disable it
let ngrokState = false;
document.querySelector("[data-ngrok]").addEventListener('change', (event)=>{
  if(event.currentTarget.checked){
    ngrokState = true;
  }else{
    ngrokState = false;
  }
})


// buttons for root and server folders

// ========
// Logs section
// ========

// setInterval(() => {
//   fs.readFile(path.join(__dirname, '../server/logs/latest.log'), 'utf8', (error, data) => {
//     if (error) {
//       console.error(error);
//       return;
//     }
//     // console.log(data);
//     document.querySelector('#logs').innerHTML = data;
//   });
// }, 300);