// modules

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { shell } = require('electron');
let configPath = path.join(__dirname, "../appconfig.json")
let config = JSON.parse(fs.readFileSync(configPath));
const spawnObj = require('child_process').spawn;
const os = require ('os');

// variables

const javaVer = document.querySelector("[data-javaVer]");
let option, selectedJava, serverOption, wrongCounter = 0, serverDirectoryContent = "", driveLetter = "c";
driveLetter = driveLetter.toUpperCase();
const username = os.userInfo ().username;

// create necessary files and directories

if (!fs.existsSync('./server/')){
  fs.mkdirSync('./server/');
}
// =======
// Welcome page
// =======
document.querySelector('input[value="Let\'s go!"]').addEventListener('click', ()=>{
  document.querySelector('.first-page').setAttribute('hidden', '');
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
    var command = `start cmd /k "${javaDir} ${ramMinSel} ${ramMaxSel} -jar ${selectedServer} ${gui}"`;
    console.log(command);
    // save settings if remember is checked
    if(document.querySelector('[data-remember]').checked){
      let configsettings = {
        java: document.querySelector('[data-javaVer]').value,
        server: document.querySelector('[data-serverFile]').value,
        ramMin: document.querySelector('[data-min]').value,
        ramMax: document.querySelector('[data-max]').value,
        ngrokState: ngrokState,
        gui: gui
      };
      let settings_data = JSON.stringify(configsettings, null, 2);
      fs.writeFileSync("appconfig.json", settings_data);
    }
    // if ngrok is on, open bat
    if(ngrokState == true){
      shell.openPath(path.join(__dirname+"../batches/ngrok.bat"))
    }
    // write server.bat file with command, open it, then create eula = true file
    glob('./server/*.bat', {}, ()=>{
      fs.writeFileSync(path.join(__dirname, '../server/server.bat'), command, 'utf-8');
      shell.openPath(path.join(__dirname, '../server/server.bat'));
      fs.writeFileSync('./server/eula.txt', 'eula = true', 'utf-8');
    });
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

// ========
// Explorer
// ========

// create file explorer menu
fs.readdir('./server/', () => {
  glob('./server/+(*.json|*.properties|*.txt)', {}, (serverDirectory)=>{
    for(var i = 0; i<serverDirectory.length;i++){
      serverDirectory[i] = serverDirectory[i].replace('./server/', '')
      serverDirectoryContent += '<input type="button" class="browser-content" value="'+serverDirectory[i]+'"style="font-size: 30px; font-size: .6vw;">';
    }
    document.querySelector('[data-browser]').innerHTML = serverDirectoryContent
    document.querySelectorAll(".browser-content").forEach(browserFile => browserFile.addEventListener("click", ()=>{
      let browserOpen = path.join(__dirname, "../server/"+browserFile.value);
      spawnObj('C:\\windows\\notepad.exe', [browserOpen]);
    }));
  });
});

// buttons for root and server folders
document.querySelector("[data-rootFolder]").addEventListener('click', ()=>{
  shell.openPath(path.join(__dirname, '../'))
})
document.querySelector("[data-serverFolder]").addEventListener('click', ()=>{
  shell.openPath(path.join(__dirname, '../server/'))
})


// define path to ngrok config file
const ngrokymlPath = `${driveLetter}:/Users/${username}/Appdata/Local/ngrok/*.yml`

// read this directory
glob(ngrokymlPath, {}, (ngrokYaml)=>{
  console.log(driveLetter);
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

// TODO: make load settings more "resistant", end welcome page