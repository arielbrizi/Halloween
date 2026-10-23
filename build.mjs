import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
const result=await build({entryPoints:['src/main.js'],bundle:true,minify:true,format:'iife',write:false,target:'es2020',legalComments:'inline'});
let html=await readFile('src/shell.html','utf8');
html=html.replace('/*CSS*/',await readFile('style.css','utf8')).replace('/*JS*/',()=>result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script'));
for(const file of ['esqueleto.jpg','brujita.jpg'])html=html.replace('assets/'+file,'data:image/jpeg;base64,'+(await readFile('assets/'+file)).toString('base64'));
html=html.replace(/[ \t]+$/gm,'');
await writeFile('index.html',html);
console.log('Juego 3D autónomo generado:',Buffer.byteLength(html),'bytes');
