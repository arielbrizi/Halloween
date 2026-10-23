import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';

// The complete game is embedded in index.html. Resolve it relative to this file,
// so starting from a different working directory also works.
const html=await readFile(new URL('../index.html',import.meta.url));
const gzip=gzipSync(html,{level:6});
const etag=`W/"${createHash('sha256').update(html).digest('hex')}"`;
const port=Number(process.env.PORT??3000);
if(!Number.isInteger(port)||port<0||port>65535)throw new Error('PORT must be an integer between 0 and 65535');

const server=createServer((req,res)=>{
  if(req.method!=='GET'&&req.method!=='HEAD'){
    res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;
  }
  const path=new URL(req.url,'http://localhost').pathname;
  if(path==='/health'){
    res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
    res.end(req.method==='HEAD'?undefined:'{"status":"ok"}');return;
  }
  if(path==='/favicon.ico'){res.writeHead(204);res.end();return;}
  if(path!=='/'&&path!=='/index.html'){
    res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end(req.method==='HEAD'?undefined:'Not found');return;
  }
  const headers={'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=0, must-revalidate','ETag':etag,'Vary':'Accept-Encoding'};
  if(req.headers['if-none-match']===etag){res.writeHead(304,headers);res.end();return;}
  // Ignore gzip when a client explicitly declines it with q=0.
  const acceptsGzip=(req.headers['accept-encoding']??'').split(',').some(item=>{
    const [coding,...parameters]=item.trim().split(';');
    return coding==='gzip'&&!parameters.some(p=>/^\s*q\s*=\s*0(?:\.0*)?\s*$/.test(p));
  });
  const body=acceptsGzip?gzip:html;
  if(acceptsGzip)headers['Content-Encoding']='gzip';
  headers['Content-Length']=body.length;
  res.writeHead(200,headers);res.end(req.method==='HEAD'?undefined:body);
});
server.on('error',error=>{console.error('Server failed:',error.message);process.exitCode=1;});
server.listen(port,'0.0.0.0',()=>console.log(`Serving Delfi y Nahue on 0.0.0.0:${server.address().port}`));
for(const signal of ['SIGTERM','SIGINT'])process.once(signal,()=>{
  server.close(()=>process.exit(0));
  server.closeIdleConnections();
  setTimeout(()=>process.exit(1),10000).unref();
});
