const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { CLIENT_RENEG_LIMIT } = require('tls');
const { shell } = require('electron');
let configPath = "./appconfig.json"
let config = JSON.parse(fs.readFileSync(configPath));


const javaVer = document.querySelector("[data-javaVer]");
let option, selectedJava, serverOption, wrongCounter = 0, serverDirectoryContent = "";

if (!fs.existsSync('./server/')){
  fs.mkdirSync('./server/');
}

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
fs.readdir('./server/', (err, serverFiles) => {
  glob('./server/*.jar', {}, (err, serverFiles)=>{
    if(serverFiles.length==0){
      document.querySelector('[data-serverFile]').innerHTML = '<option>Server .jar file not found</option>';
      document.querySelector('[data-serverFile]').setAttribute('disabled', '');
      wrongCounter++
    }
    else{
      for(var i = 0; i<serverFiles.length;i++){
        // console.log(serverFiles+','+i)
        serverFiles[i] = serverFiles[i].replace('./server/', '')
        serverOption+= '<option value="'+serverFiles[i]+'">'+serverFiles[i]+'</option>';
        document.querySelector('[data-serverFile]').innerHTML = serverOption
      }
    }
  });
});

document.querySelector("[data-load]").addEventListener('click', () => {
  // console.dir(config);
  document.querySelector('[data-javaVer]').value = config.java;
  document.querySelector('[data-serverFile]').value = config.server;
  document.querySelector('[data-min]').value = config.ramMin;
  document.querySelector('[data-max]').value = config.ramMax;
})
let ramMinSel = "-Xms"+document.querySelector('[data-min]').value+"G";
let ramMaxSel = "-Xmx"+document.querySelector('[data-max]').value+"G";
document.querySelector("[data-bs-start]").addEventListener('click', () => {
  if(wrongCounter == 0){
    const selectedJava = document.querySelector('[data-javaVer]').value;
    const selectedServer = path.join(__dirname, ("..\\server\\"+document.querySelector('[data-serverFile]').value));
    
    const javaDir = 'C:\\Progra~1\\Java\\'+selectedJava+'\\bin\\java.exe'
    var command = `start cmd /k "${javaDir} ${ramMinSel} ${ramMaxSel} -jar ${selectedServer} ${gui}"`;
    // console.log("Running java in: "+javaDir)
    console.log(command);
    if(document.querySelector('[data-remember]').checked){
        let configsettings = {
          java: document.querySelector('[data-javaVer]').value,
          server: document.querySelector('[data-serverFile]').value,
          ramMin: document.querySelector('[data-min]').value,
          ramMax: document.querySelector('[data-max]').value
        };
      
        let settings_data = JSON.stringify(configsettings, null, 2);
      
        fs.writeFileSync("appconfig.json", settings_data);
    }
    if(ngrokState == true){
      shell.openPath(path.join(__dirname+"../batches/ngrok.bat"))
    }
    glob('./server/*.bat', {}, (err, serverBatches)=>{
      fs.writeFileSync(path.join(__dirname, '../server/server.bat'), command, 'utf-8');
      shell.openPath(path.join(__dirname, '../server/server.bat'));
      fs.writeFileSync('./server/eula.txt', 'eula = true', 'utf-8');
    });
  }else{
    console.warn("Something's wrong, check your selections once again.");
  }
});

document.querySelector('[data-stop]').addEventListener('click', ()=>{
  fs.writeFileSync('../batches/stop.bat', "taskkill /f /im java.exe", 'utf-8');
  shell.openPath(__dirname+'..\\batches\\stop.bat');
})

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
    // console.log("val "+input.value);
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

let gui = '-nogui';

document.querySelector("[data-gui]").addEventListener('change', (event)=>{
  if(event.currentTarget.checked){
    gui = '';
  }else{
    gui = '-nogui'
  }
})

let ngrokState = false;
document.querySelector("[data-ngrok]").addEventListener('change', (event)=>{
  if(event.currentTarget.checked){
    ngrokState = true;
  }else{
    ngrokState = false;
  }
})

fs.readdir('./server/', (err, serverDirectory) => {
  glob('./server/+(*.json|*.properties|*.txt)', {}, (err, serverDirectory)=>{
    for(var i = 0; i<serverDirectory.length;i++){
      serverDirectory[i] = serverDirectory[i].replace('./server/', '')
      serverDirectoryContent += '<input type="button" class="browser-content" value="'+serverDirectory[i]+'"style="font-size: 30px; font-size: .6vw;">';
    }
    document.querySelector('[data-browser]').innerHTML = serverDirectoryContent
    document.querySelectorAll(".browser-content").forEach(browserFile => browserFile.addEventListener("click", ()=>{
      let browserOpen = path.join(__dirname+"\\server\\"+browserFile.value);
      let browserCmd = `start cmd /k "notepad ${browserOpen}"\nexit /s`
      console.log(browserCmd);
      fs.writeFileSync(__dirname+"/batches/browsercache.bat", browserCmd);
      shell.openPath(__dirname+"/batches/browsercache.bat")
    }));
  });
});