export const LIMITS=Object.freeze({plants:24,history:100,projects:100,bytes:1048576,seed:0xffffffff,name:80,textureWidth:480,textureHeight:320});
export const SPECIES=Object.freeze({
  upright:{label:'Upright',shape:'oval',leaves:9},
  rosette:{label:'Rosette',shape:'round',leaves:12},
  trailing:{label:'Trailing',shape:'point',leaves:10}
});
export const POTS=Object.freeze({terracotta:'#bc704d',sand:'#d1b787',ink:'#55656a'});

export class GardenError extends Error{
  constructor(code,message){super(message);this.name='GardenError';this.code=code;}
}
export function ensure(ok,code,message){if(!ok)throw new GardenError(code,message);}
export function exact(value,keys){
  ensure(value&&typeof value==='object'&&!Array.isArray(value),'DATA','Expected a data object.');
  ensure(Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key)),'DATA','Unexpected or missing fields.');
}
export function bounded(value,min,max,label,integer=false){
  ensure(Number.isFinite(value)&&value>=min&&value<=max&&(!integer||Number.isInteger(value)),'INPUT',`${label} must be ${integer?'a whole number ':''}between ${min} and ${max}.`);
  return value;
}
export function cleanName(value,label='Name'){
  ensure(typeof value==='string'&&value.trim().length>0&&value.trim().length<=LIMITS.name,'NAME',`${label} must contain 1–${LIMITS.name} characters.`);
  return value.trim();
}
export function validatePlant(input){
  exact(input,['id','name','seed','species','pot','growth','x','y']);
  const plant=structuredClone(input);
  ensure(typeof plant.id==='string'&&/^[a-z0-9][a-z0-9-]{0,63}$/.test(plant.id),'ID','Invalid plant identifier.');
  plant.name=cleanName(plant.name,'Plant name');
  bounded(plant.seed,0,LIMITS.seed,'Seed',true);
  ensure(Object.hasOwn(SPECIES,plant.species),'SPECIES','Choose an available plant silhouette.');
  ensure(Object.hasOwn(POTS,plant.pot),'POT','Choose an available pot.');
  bounded(plant.growth,0,5,'Growth stage',true);
  bounded(plant.x,0,1,'Horizontal arrangement');bounded(plant.y,0,1,'Vertical arrangement');
  return plant;
}
export function validateProject(input){
  ensure(JSON.stringify(input)?.length<=LIMITS.bytes,'SIZE','Collection exceeds 1 MiB.');
  exact(input,['schema','id','name','plants','selectedPlantId']);
  const project=structuredClone(input);
  ensure(project.schema==='glass-garden.project/1','SCHEMA','This project format is unsupported.');
  ensure(typeof project.id==='string'&&/^[a-z0-9][a-z0-9-]{0,63}$/.test(project.id),'ID','Invalid collection identifier.');
  project.name=cleanName(project.name,'Collection name');
  ensure(Array.isArray(project.plants)&&project.plants.length<=LIMITS.plants,'PLANTS','Collection can contain at most 24 plants.');
  project.plants=project.plants.map(validatePlant);
  ensure(new Set(project.plants.map(plant=>plant.id)).size===project.plants.length,'ID','Plant identifiers must be unique.');
  ensure(project.selectedPlantId===null||project.plants.some(plant=>plant.id===project.selectedPlantId),'SELECTION','Selected plant is not in this collection.');
  return project;
}
export function makeProject(id,name='Untitled garden'){
  return validateProject({schema:'glass-garden.project/1',id,name,plants:[],selectedPlantId:null});
}
