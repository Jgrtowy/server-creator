const {chdir} = require('process')
const path = require('path')
const fs = require('fs')
const glob = require('glob')
const { spawn } = require('child_process');
const {shell, BrowserWindow} = require('electron');
const { dir } = require('console');
const spawnObj = require('child_process').spawn;
// root
chdir(path.join(__dirname, '../../'))

// let serverDirectoryContent;
// glob('./server/+(*.json|*.properties|*.txt)', {}, (err, serverDirectory)=>{
//   for(var i = 0; i<serverDirectory.length;i++){
//     serverDirectory[i] = serverDirectory[i].replace('./server/', '')
//     serverDirectoryContent += '<input type="button" class="browser-content" value="'+serverDirectory[i]+'"style="font-size: 30px; font-size: 1vw;">';
//   }
//   browser.innerHTML = serverDirectoryContent
//   document.querySelectorAll(".browser-content").forEach(browserFile => browserFile.addEventListener("click", ()=>{
//     let browserOpen = "./server/"+browserFile.value;
//     spawnObj('C:\\windows\\notepad.exe', [browserOpen]);
//   }));
// });

let browser = document.querySelector('[data-browser]')
let currentdir = '.'

document.querySelector('#currentPath').innerHTML = path.dirname(path.join(__dirname, currentdir))

let fileArr = [];

fs.readdir(currentdir, (err, files)=>{
  for(let item of files){
    fs.stat(`${currentdir}/${item}`, (err, stats) => {
      if (stats.isDirectory()) {
        pushToArr(item, "dir")
      }else{
        pushToArr(item, "")
      }
    })
  }
  files.forEach((val, key, arr) => {
    if (Object.is(arr.length - 1, key)) {
      // execute last item logic
      console.log(`Last callback call at index ${key} with value ${val}` );
      pushToArr("", "", true)
    }
  });
})

const pushToArr = (file, type, log) => {
  const ignored = [".git", ".vs", "node_modules", ".gitignore"]
  for(const ignore of ignored){
    if(file === ignore){
      console.log(file);
      return;
    }
  }
  if(type == "dir"){ 
    fileArr.push(`<div type="button" class="explorerItem dirEl" title="${file}"><img src="../../public/folder.svg">${file}</div>`)
  }else{
    fileArr.push(`<div type="button" class="explorerItem fileEl" title="${file}"><img src="../../public/file.svg">${file}</div>`)
  }
  if(log){
    events(fileArr)
  }
}
const events = async (files) => {
  await new Promise(r => setTimeout(r, 100));
  for (const [i, item] of files.entries()) {
    if (i === 0) continue; // skip the first iteration
    browser.innerHTML += item;
  }

  await new Promise(r => setTimeout(r, 100));

  document.querySelectorAll('.explorerItem').forEach((e)=>{
    e.className += " explorerItemCSS"
    e.addEventListener('click', ()=>{
      const classes = e.classList;
      console.log(classes[1]);
      
      if(classes[1] == "dirEl"){
        // spawnObj('C:\\Windows\\explorer.exe', [e.title])
      }else{
        // spawnObj('C:\\Windows\\notepad.exe', [e.title])
      }
    })
  })
}