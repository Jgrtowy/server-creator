const fs = require('fs');
const path = require('path');
const glob = require('glob');

const javaVer = document.querySelector("[data-javaVer]");
let option, selectedJava, serverOption;

if (!fs.existsSync('./server/')){
  fs.mkdirSync('./server/');
}

fs.readdir('C:/Progra~1/Java', (err, files) => {
  if (files.length == 0) {
    console.warn("Java not found");
  }
  else{
    for(var i = 0; i<files.length;i++){
      option+= '<option value="'+files[i]+'">'+files[i]+'</option>';
    }
    javaVer.innerHTML = option
  }
});

fs.readdir('./server/', (err, serverFiles) => {
  if (serverFiles.length == 0) {
    document.querySelector('[data-serverFile]').innerHTML = '<option>Server files not found</option>';
    document.querySelector('[data-serverFile]').setAttribute('disabled', '');
  }
  // else{
  //   for(var i = 0; i<serverFiles.length;i++){
  //     serverOption+= '<option value="'+serverFiles[i]+'">'+serverFiles[i]+'</option>';
  //     document.querySelector('[data-serverFile]').innerHTML = serverOption
  //   }
  // }
  else{
    glob('./server/*.jar', {}, (err, serverFiles)=>{
      for(var i = 0; i<serverFiles.length;i++){
        // console.log(serverFiles+','+i)
        serverFiles[i] = serverFiles[i].replace('./server/', '')
        serverOption+= '<option value="'+serverFiles[i]+'">'+serverFiles[i]+'</option>';
        document.querySelector('[data-serverFile]').innerHTML = serverOption
      }
    })
  }
});





document.querySelector("[data-bs-start]").addEventListener('click', () => {
  selectedJava = document.querySelector('[data-serverFile]').value;
  console.log(selectedJava);

  javaDir = 'C:\\Progra~1\\Java\\'+selectedJava+'\\bin\\java.exe'
  console.log(javaDir)
});
