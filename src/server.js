import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadFrameFactory} from '../adapters/framefactory.js';
import {createFileStorage} from './storage.js';
import {createSession} from './session.js';
import {ensure,LIMITS} from '../kits/glass-garden-domain-kit/contracts.js';

const ROOT=fileURLToPath(new URL('../',import.meta.url));
const WEB_ROOT=resolve(ROOT,'web');
const MIME={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json'};

export async function startServer({port=0,storageRoot=process.env.GARDEN_STORAGE_ROOT??resolve(ROOT,'.local/projects'),factory=null}={}){
  factory??=await loadFrameFactory();
  const storage=createFileStorage(storageRoot),sessions=new Map();
  let sessionsStarting=0;
  await mkdir(storageRoot,{recursive:true});

  async function readBody(request){
    let size=0;const parts=[];
    for await(const part of request){size+=part.length;ensure(size<=LIMITS.bytes,'SIZE','Request exceeds 1 MiB.');parts.push(part);}
    try{return JSON.parse(Buffer.concat(parts).toString()||'{}');}
    catch{throw Object.assign(new Error('Invalid JSON request.'),{code:'JSON'});}
  }
  const server=createServer(async(request,response)=>{
    response.setHeader('X-Content-Type-Options','nosniff');
    response.setHeader('Cache-Control','no-store');
    response.setHeader('Referrer-Policy','no-referrer');
    response.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    const send=(status,data,type='application/json')=>{
      response.writeHead(status,{'Content-Type':type});
      response.end(type==='application/json'?JSON.stringify(data):data);
    };
    try{
      const url=new URL(request.url,'http://127.0.0.1');
      const path=decodeURIComponent(url.pathname);
      if(path.startsWith('/api/')){
        if(request.method!=='GET'){
          const origin=request.headers.origin;
          ensure(!origin||origin===`http://${request.headers.host}`,'ORIGIN','Requests must come from this local studio.');
          ensure(/^(127\.0\.0\.1|localhost):\d+$/.test(request.headers.host??''),'HOST','Invalid local host.');
        }
        if(path==='/api/projects'&&request.method==='GET')return send(200,{projects:await storage.list()});
        if(path==='/api/sessions'&&request.method==='POST'){
          ensure(sessions.size+sessionsStarting<16,'LIMIT','Too many active garden sessions. Close an unused tab.');
          sessionsStarting++;
          try{
            const session=await createSession(factory,storage);
            sessions.set(session.id,{session,touched:Date.now()});
            return send(201,{id:session.id,...session.info()});
          }finally{sessionsStarting--;}
        }
        const match=path.match(/^\/api\/sessions\/([a-f0-9-]{36})(?:\/(action|proof|close))?$/);
        ensure(match,'ROUTE','Unknown API endpoint.');
        const entry=sessions.get(match[1]);
        ensure(entry,'SESSION','Garden session expired. Reopen to recover saved collections.');
        entry.touched=Date.now();
        if(request.method==='GET'&&!match[2])return send(200,entry.session.info());
        if(request.method==='GET'&&match[2]==='proof'){
          const frame=entry.session.runtime.snapshot(),provider=entry.session.provider.inspect(),pixels=entry.session.pixels();
          return send(200,{frame,provider,texture:{width:pixels.width,height:pixels.height,rgba:Buffer.from(pixels.data).toString('base64')}});
        }
        ensure(request.method==='POST','METHOD','This operation requires POST.');
        if(match[2]==='close'){
          try{return send(200,await entry.session.close());}
          finally{sessions.delete(match[1]);}
        }
        ensure(match[2]==='action','ROUTE','Unknown operation.');
        const input=await readBody(request);
        ensure(typeof input.action==='string'&&/^(garden|project)\.[a-z]+$/.test(input.action),'ACTION','Invalid action.');
        return send(200,await entry.session.action(input.action,input.payload??{}));
      }
      ensure(request.method==='GET','METHOD','Only GET is supported for assets.');
      const file=resolve(WEB_ROOT,'.'+(path==='/'?'/index.html':path));
      ensure(file.startsWith(WEB_ROOT+sep),'ROUTE','Asset path is not allowed.');
      return send(200,await readFile(file),MIME[extname(file)]??'application/octet-stream');
    }catch(error){
      if(!response.headersSent)send(error.code==='ENOENT'?404:400,{error:error.message,code:error.code??'ERROR'});
      else response.destroy(error);
    }
  });

  const cleaner=setInterval(async()=>{
    for(const[id,entry]of sessions){
      if(Date.now()-entry.touched<=30*60*1000)continue;
      await entry.session.close().catch(()=>{});sessions.delete(id);
    }
  },60000);
  cleaner.unref();
  try{
    await new Promise((resolveListen,rejectListen)=>{
      server.once('error',rejectListen);server.listen(port,'127.0.0.1',resolveListen);
    });
  }catch(error){clearInterval(cleaner);throw error;}
  return{
    url:`http://127.0.0.1:${server.address().port}`,
    server,
    async close(){
      clearInterval(cleaner);
      await Promise.all([...sessions.values()].map(({session})=>session.close().catch(()=>{})));
      sessions.clear();
      await new Promise(resolveClose=>server.close(()=>resolveClose()));
    }
  };
}
