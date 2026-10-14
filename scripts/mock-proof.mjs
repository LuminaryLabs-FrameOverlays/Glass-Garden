import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {loadFrameFactory,PIN} from '../adapters/framefactory.js';
import {createFileStorage} from '../src/storage.js';
import {createSession} from '../src/session.js';
const root=await mkdtemp(join(tmpdir(),'garden-proof-'));try{const factory=await loadFrameFactory(),storage=createFileStorage(root),session=await createSession(factory,storage);await session.action('garden.add',{id:'seeded-fern',name:'Fern Study',seed:73421,species:'trailing',pot:'ink'});for(let i=0;i<3;i++)await session.action('garden.grow',{id:'seeded-fern'});const pixels=session.pixels();assert.equal(pixels.data.length,480*320*4);assert(session.provider.inspect().overlays[0].texture.bytes>0);await session.action('project.save');const id=session.info().project.id;await session.close();const reopened=await createSession(factory,storage);await reopened.action('project.load',{id});assert.equal(reopened.info().project.plants[0].growth,3);assert.equal(reopened.info().dirty,false);const proof={status:'PASS',frameFactoryCommit:PIN,provider:'mock',simulation:true,renderSource:'FrameFactory surface.garden renderer',texture:{width:pixels.width,height:pixels.height,bytes:pixels.data.byteLength},saveReopen:'PASS',runtimeBehaviorVerified:false,visualQualityVerified:false};await reopened.close();console.log(JSON.stringify(proof,null,2));}finally{await rm(root,{recursive:true,force:true});}
