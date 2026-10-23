import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {request} from 'node:http';
import {gunzipSync} from 'node:zlib';

// No Python (or other shell executable) is available to this process. PORT=0
// asks the OS for a free port, exercising the same binding Railway supplies.
const child=spawn(process.execPath,[fileURLToPath(new URL('../scripts/server.mjs',import.meta.url))],{
  cwd:tmpdir(),env:{...process.env,PATH:'/not-installed',PORT:'0'},stdio:['ignore','pipe','pipe']
});
let logs='';child.stderr.on('data',data=>logs+=data);
const port=await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('Server startup timed out: '+logs)),15000);
  child.once('error',error=>{clearTimeout(timer);reject(error);});
  child.once('exit',code=>{clearTimeout(timer);reject(Error('Server exited '+code+': '+logs));});
  let output='';child.stdout.on('data',data=>{output+=data;const match=output.match(/0\.0\.0\.0:(\d+)/);if(match){clearTimeout(timer);resolve(Number(match[1]));}});
});
after(async()=>{if(child.exitCode===null){const exited=new Promise(resolve=>child.once('exit',resolve));child.kill('SIGTERM');await exited;}});
const base=`http://127.0.0.1:${port}`;

test('Railway-compatible startup without Python, health check and complete game response',async()=>{
  const health=await fetch(base+'/health');assert.equal(health.status,200);assert.deepEqual(await health.json(),{status:'ok'});
  const response=await fetch(base+'/?deploy=smoke',{headers:{'Accept-Encoding':'identity'}});
  assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/^text\/html/);
  assert.equal(await response.text(),await readFile(new URL('../index.html',import.meta.url),'utf8'));
});
test('Compressed payload decodes to the exact standalone game',async()=>{
  const {headers,body}=await new Promise((resolve,reject)=>{const req=request(base,{headers:{'Accept-Encoding':'gzip'}},res=>{const chunks=[];res.on('data',c=>chunks.push(c));res.on('end',()=>resolve({headers:res.headers,body:Buffer.concat(chunks)}));});req.on('error',reject);req.end();});
  assert.equal(headers['content-encoding'],'gzip');const html=await readFile(new URL('../index.html',import.meta.url));assert.deepEqual(gunzipSync(body),html);assert(body.length<html.length);
  const declined=await fetch(base,{headers:{'Accept-Encoding':'gzip;q=0'}});assert.equal(declined.headers.get('content-encoding'),null);await declined.arrayBuffer();
});
test('HEAD, conditional requests, unknown paths and unsupported methods',async()=>{
  const head=await fetch(base+'/index.html',{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
  const cached=await fetch(base,{headers:{'If-None-Match':head.headers.get('etag')}});assert.equal(cached.status,304);
  const missing=await fetch(base+'/package.json');assert.equal(missing.status,404);
  const post=await fetch(base,{method:'POST'});assert.equal(post.status,405);assert.equal(post.headers.get('allow'),'GET, HEAD');
});
