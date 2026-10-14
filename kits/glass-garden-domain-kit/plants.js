import {SPECIES,ensure,bounded,cleanName,validatePlant,validateProject,LIMITS} from './contracts.js';

function random(seed){
  let state=seed>>>0;
  return ()=>{
    state=(state+0x6d2b79f5)>>>0;
    let value=state;value=Math.imul(value^(value>>>15),value|1);value^=value+Math.imul(value^(value>>>7),value|61);
    return ((value^(value>>>14))>>>0)/4294967296;
  };
}
export function createPlant({id,name='Plant',seed=1,species='upright',pot='terracotta',growth=0,x=.5,y=.5}={}){
  return validatePlant({id,name:cleanName(name,'Plant name'),seed:bounded(seed,0,LIMITS.seed,'Seed',true),species,pot,growth,x,y});
}
export function plantForm(seed,species,growth){
  const type=SPECIES[species];ensure(type,'SPECIES','Choose an available plant silhouette.');
  bounded(seed,0,LIMITS.seed,'Seed',true);bounded(growth,0,5,'Growth stage',true);
  const next=random(seed),count=type.leaves+(growth>0?Math.ceil(growth*type.leaves/5):0),leaves=[];
  for(let i=0;i<count;i++){
    const angle=(Math.PI*2*i/type.leaves)+(next()-.5)*.5,ring=Math.floor(i/type.leaves),length=.23+next()*.2,scale=.55+next()*.75;
    leaves.push({angle,reach:length*(1+growth*.16)+ring*.03,width:.055*scale,height:.085*scale,shade:Math.floor(next()*34)});
  }
  return {species,shape:type.shape,growth,leaves};
}
export function editProject(input,action,payload={}){
  const project=validateProject(input);
  switch(action){
    case'rename':project.name=cleanName(payload.name,'Collection name');break;
    case'add':{
      ensure(project.plants.length<LIMITS.plants,'PLANTS','A collection can contain at most 24 plants.');
      const index=project.plants.length,id=payload.id??`plant-${index+1}`;
      ensure(!project.plants.some(plant=>plant.id===id),'ID','That plant identifier already exists.');
      const column=index%6,row=Math.floor(index/6);
      project.plants.push(createPlant({id,name:payload.name??`Plant ${index+1}`,seed:payload.seed??1,species:payload.species??'upright',pot:payload.pot??'terracotta',growth:0,x:.08+column*.168,y:.12+row*.24}));
      project.selectedPlantId=id;break;
    }
    case'edit':{
      const plant=project.plants.find(item=>item.id===payload.id);ensure(plant,'MISSING','Select a plant in this collection.');
      for(const key of ['name','seed','species','pot'])if(Object.hasOwn(payload,key))plant[key]=payload[key];
      validatePlant(plant);break;
    }
    case'grow':{
      const plant=project.plants.find(item=>item.id===payload.id);ensure(plant,'MISSING','Select a plant in this collection.');
      ensure(plant.growth<5,'GROWN','This simulated plant is at its final stage.');plant.growth++;break;
    }
    case'arrange':{
      const plant=project.plants.find(item=>item.id===payload.id);ensure(plant,'MISSING','Select a plant in this collection.');
      plant.x=bounded(payload.x,0,1,'Horizontal arrangement');plant.y=bounded(payload.y,0,1,'Vertical arrangement');break;
    }
    case'select':
      ensure(payload.id===null||project.plants.some(plant=>plant.id===payload.id),'MISSING','Choose a plant in this collection.');project.selectedPlantId=payload.id;break;
    case'remove':{
      const index=project.plants.findIndex(plant=>plant.id===payload.id);ensure(index>=0,'MISSING','Select a plant in this collection.');
      project.plants.splice(index,1);if(project.selectedPlantId===payload.id)project.selectedPlantId=project.plants.at(-1)?.id??null;break;
    }
    default:ensure(false,'ACTION','Unknown garden action.');
  }
  return validateProject(project);
}
export function duplicateProject(input,id){
  const project=validateProject(input);project.id=id;project.name=`${project.name} copy`.slice(0,LIMITS.name);return validateProject(project);
}
