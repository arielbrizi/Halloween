import recoleta from '../assets/maps/recoleta.json';
import obelisco from '../assets/maps/obelisco.json';
import caminito from '../assets/maps/caminito.json';
export const maps=[recoleta,obelisco,caminito];
export const MAP_SCALE=.5;
export function inside(x,z,p){let hit=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
export function buildMap(THREE,city,n,{box,sphere,cylinder,mat,sign,lamp}){
 const data=maps[n],obstacles=[],polygons=[];const scale=MAP_SCALE;
 box(city,0,-.35,0,750,.6,750,n===0?'#39473f':'#4d5553');
 for(const road of data.roads){const foot=['path','footway','pedestrian','steps','cycleway'].includes(road.type);const color=foot?(n===0?'#aaa18a':'#a3a19a'):'#3a4248';for(let i=1;i<road.points.length;i++){const a=road.points[i-1].map(x=>x*scale),b=road.points[i].map(x=>x*scale),dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len<.05)continue;const m=box(city,(a[0]+b[0])/2,foot?.025:.005,(a[1]+b[1])/2,len,.025,Math.max(.65,road.width*scale),color);m.rotation.y=-Math.atan2(dz,dx);if(!foot&&road.width>5&&len>6){for(let t=1.5;t<len;t+=5){const stripe=box(city,a[0]+dx*t/len,.03,a[1]+dz*t/len,1.6,.015,.06,'#ccc6a0');stripe.rotation.y=m.rotation.y;}}}}
 for(const item of data.buildings){const p=item.points.map(a=>a.map(x=>x*scale));const cx=p.reduce((s,a)=>s+a[0],0)/p.length,cz=p.reduce((s,a)=>s+a[1],0)/p.length;const shape=new THREE.Shape();p.forEach((a,i)=>i?shape.lineTo(a[0],-a[1]):shape.moveTo(a[0],-a[1]));const h=Math.max(2,item.height*scale);const geometry=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,steps:1});geometry.rotateX(-Math.PI/2);const colors=n===2?['#bc6950','#458b9b','#ba9a51','#956b93','#6d9575']:['#a3a497','#8b9390','#c2b6a1','#777f80','#b6afa2'];const color=/^#[0-9a-f]{6}$/i.test(item.color)?item.color:colors[item.id%colors.length];const mesh=new THREE.Mesh(geometry,mat(color));mesh.castShadow=true;mesh.receiveShadow=true;city.add(mesh);
 const roofGeom=new THREE.ShapeGeometry(shape);roofGeom.rotateX(-Math.PI/2);const roof=new THREE.Mesh(roofGeom,mat(n===2?'#72746d':'#64716f'));roof.position.y=h+.025;city.add(roof);
 const xs=p.map(a=>a[0]),zs=p.map(a=>a[1]);polygons.push({points:p,minX:Math.min(...xs),maxX:Math.max(...xs),minZ:Math.min(...zs),maxZ:Math.max(...zs)});
 // OpenStreetMap footprints are real; facade details are procedural decoration.
 if(Math.hypot(cx,cz)<100){for(let i=1;i<p.length;i++){const a=p[i-1],b=p[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len<2||len>150)continue;for(let t=1.2;t<len-1;t+=2.5){for(let y=1.5;y<h-.6;y+=2){if((item.id+Math.floor(t*3)+Math.floor(y))%4===0)continue;const m=box(city,a[0]+dx*t/len+dz/len*.03,y,a[1]+dz*t/len-dx/len*.03,.65,1,.06,(item.id+Math.floor(t))%3===0?'#efc58a':'#7c9da8',.4);m.rotation.y=-Math.atan2(dz,dx);}}}}
 }
 const blocked=(x,z,pad=0)=>polygons.some(o=>x>=o.minX-pad&&x<=o.maxX+pad&&z>=o.minZ-pad&&z<=o.maxZ+pad&&inside(x,z,o.points));
 if(n===1){const h=67.5*scale;const base=3.5*scale;box(city,0,.2,0,7,.4,7,'#b2b5aa');const monument=new THREE.Mesh(new THREE.CylinderGeometry(.22,base,h-3,4),mat('#e4dfca'));monument.rotation.y=Math.PI/4;monument.position.set(0,(h-3)/2+.4,0);monument.castShadow=true;city.add(monument);const tip=new THREE.Mesh(new THREE.ConeGeometry(.32,3,4),mat('#f0e7ce'));tip.rotation.y=Math.PI/4;tip.position.set(0,h-1.1,0);city.add(tip);box(city,0,1.6,base/Math.sqrt(2)+.04,.45,2,.08,'#52616a');obstacles.push({x:0,z:0,r:2.6});sign('AVENIDA 9 DE JULIO',-17,4.5,9,'#ebf0d0',1.2);sign('CORRIENTES',14,4,1,'#d5eac3',1);}
 if(n===0){
 // Decorative mausoleums are placed between the actual mapped cemetery paths.
 const paths=data.roads.filter(r=>['footway','path','pedestrian'].includes(r.type));
 const nearPath=(x,z)=>paths.some(r=>r.points.some(p=>Math.hypot(p[0]*scale-x,p[1]*scale-z)<1.8));
 for(let x=-32;x<=32;x+=3.8)for(let z=-32;z<=32;z+=4.2){if(blocked(x,z)||nearPath(x,z)||Math.hypot(x,z-10)<3)continue;const k=Math.abs(Math.floor(x*19+z*7))%4,h=k===0?2.9:1.7;box(city,x,h/2,z,1.7,h,2.1,k===0?'#87918a':'#b1aca0');if(k===0){const roof=cylinder(city,x,h+.25,z,0,1.5,.7,'#a2aaa2',4);roof.rotation.y=Math.PI/4;box(city,x,1,z+1.07,.65,1.5,.05,'#273e41');}else{box(city,x,h+.45,z,.12,.8,.12,'#d0c8ae');box(city,x,h+.6,z,.6,.12,.12,'#d0c8ae');}obstacles.push({x,z,r:1.1});}
 sign('CEMENTERIO DE LA RECOLETA',0,4,-38,'#e8d5ac',1.6);
 }
 if(n===2){sign('CAMINITO',0,4,-12,'#ffe4a2',1.5);for(let x=-6;x<7;x+=2){const m=sphere(city,x,5,-10,.1,['#efb874','#dd9ad3','#adf4bc'][Math.abs(x)%3],2);}for(const o of data.buildings.filter(b=>b.name).slice(0,5)){const a=o.points[0];if(Math.hypot(...a)<140)sign(o.name.slice(0,22).toUpperCase(),a[0]*scale,4,a[1]*scale+.1,'#ede7cd',.8);}}
 for(let z=-36;z<=36;z+=18){for(const x of [-10,10])if(!blocked(x,z)&&!obstacles.some(o=>Math.hypot(o.x-x,o.z-z)<2))lamp(x,z);}
 sphere(city,100,95,-180,4,'#efe3c5',1);
 let spawn={x:0,z:10};if(blocked(spawn.x,spawn.z)||obstacles.some(o=>Math.hypot(o.x-spawn.x,o.z-spawn.z)<o.r+.5)){const choices=data.roads.filter(r=>['footway','pedestrian','path'].includes(r.type)).flatMap(r=>r.points).map(p=>({x:p[0]*scale,z:p[1]*scale})).filter(p=>Math.abs(p.x)<35&&Math.abs(p.z)<35&&!blocked(p.x,p.z)&&!obstacles.some(o=>Math.hypot(o.x-p.x,o.z-p.z)<o.r+.5)).sort((a,b)=>Math.hypot(a.x,a.z-10)-Math.hypot(b.x,b.z-10));if(choices.length)spawn=choices[0];}
 return {obstacles,polygons,spawn,data};
}
