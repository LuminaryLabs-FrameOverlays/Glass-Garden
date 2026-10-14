import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const rootHere=fileURLToPath(new URL('../',import.meta.url));
export const PIN='a01fedaedd6cf0ea5df84fa710db0caf8c6e8aec';
export async function loadFrameFactory(root=process.env.FRAMEFACTORY_ROOT??resolve(rootHere,'../../2026-10-13/task/FrameFactory')){const observed=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();if(observed!==PIN)throw new Error(`FrameFactory pin mismatch: expected ${PIN}, received ${observed}`);const dirty=execFileSync('git',['-C',root,'status','--porcelain','--untracked-files=no'],{encoding:'utf8'}).trim();if(dirty)throw new Error('FrameFactory has tracked modifications. Use a clean pinned dependency checkout.');const frame=JSON.parse(await readFile(resolve(rootHere,'frame/frame.json'),'utf8'));const [runtime,mock,validation]=await Promise.all(['src/runtime/frame-runtime.mjs','adapters/mock/index.mjs','src/frame/validation/index.mjs'].map(x=>import(pathToFileURL(resolve(root,x)))));const result=validation.validateFrame(frame);if(!result.ok)throw new Error(result.errors.join('\n'));return {root,frame,createFrameRuntime:runtime.createFrameRuntime,createMockProvider:mock.createMockProvider};}
