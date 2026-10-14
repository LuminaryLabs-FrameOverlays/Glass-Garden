import {LIMITS,POTS,validateProject,bounded} from './contracts.js';
import {plantForm} from './plants.js';

const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const shade=(color,delta)=>color.map(v=>Math.max(0,Math.min(255,v+delta)));

/** Produce the exact bounded RGBA texture submitted by the FrameFactory renderer. */
export function gardenPixels(input,width=LIMITS.textureWidth,height=LIMITS.textureHeight){
  const project=validateProject(input);
  bounded(width,1,1024,'Texture width',true);bounded(height,1,1024,'Texture height',true);
  const data=new Uint8Array(width*height*4);
  const put=(x,y,color)=>{
    if(x<0||x>=width||y<0||y>=height)return;
    const at=(y*width+x)*4;data[at]=color[0];data[at+1]=color[1];data[at+2]=color[2];data[at+3]=255;
  };
  const ellipse=(cx,cy,rx,ry,angle,color)=>{
    const radius=Math.max(rx,ry),cos=Math.cos(angle),sin=Math.sin(angle);
    for(let y=Math.floor(cy-radius);y<=cy+radius;y++)for(let x=Math.floor(cx-radius);x<=cx+radius;x++){
      const dx=x-cx,dy=y-cy,u=dx*cos+dy*sin,v=-dx*sin+dy*cos;
      if((u*u)/(rx*rx)+(v*v)/(ry*ry)<=1)put(x,y,color);
    }
  };
  const line=(x1,y1,x2,y2,color,widthPx=2)=>{
    const distance=Math.ceil(Math.hypot(x2-x1,y2-y1));
    for(let i=0;i<=distance;i++){const t=distance?i/distance:0;ellipse(x1+(x2-x1)*t,y1+(y2-y1)*t,widthPx,widthPx,0,color);}
  };

  const background=[235,239,225],baseline=Math.floor(height*.78);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)put(x,y,background);
  for(let x=0;x<width;x++)put(x,baseline,[204,213,193]);

  for(const plant of project.plants){
    const cx=Math.round(24+plant.x*(width-48));
    const floor=Math.round(height*(.74-plant.y*.44));
    const stage=plant.growth,scale=.55+stage*.12,baseY=floor-17;
    const form=plantForm(plant.seed,plant.species,stage);
    const green=plant.species==='rosette'?[84,140,86]:plant.species==='trailing'?[67,143,101]:[65,126,77];
    const stem=[83,113,74],maxHeight=(30+stage*10)*scale;
    for(const leaf of form.leaves){
      const side=Math.cos(leaf.angle),up=Math.sin(leaf.angle);
      const x=cx+side*leaf.reach*width*.18*scale,y=baseY-up*maxHeight;
      line(cx,baseY,x,y,stem,1.6);
      const color=shade(green,leaf.shade-12),round=form.shape==='round';
      const widthFactor=round?.44:.29,heightFactor=round?.4:.56;
      ellipse(x,y,leaf.width*width*widthFactor*scale,leaf.height*height*heightFactor*scale,leaf.angle,color);
      if(form.shape==='point')ellipse(x,y,leaf.width*width*.37*scale,leaf.height*height*.32*scale,leaf.angle,shade(color,15));
    }
    const pot=rgb(POTS[plant.pot]),potTop=baseY+2,halfWidth=16+stage*1.1,potHeight=18;
    for(let y=0;y<potHeight;y++){
      const widen=3*y/potHeight;
      for(let x=-halfWidth/2-widen;x<=halfWidth/2+widen;x++)put(cx+Math.round(x),potTop+y,shade(pot,y*.6));
    }
    for(let x=-halfWidth/2-2;x<=halfWidth/2+2;x++)put(cx+x,potTop,[88,85,65]);
  }
  return {type:'rgba8',width,height,data};
}
