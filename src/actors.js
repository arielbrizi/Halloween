import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone as cloneSkeleton} from 'three/addons/utils/SkeletonUtils.js';
import basicJSON from '../assets/models/Zombie_Basic.gltf';
import bruteJSON from '../assets/models/Zombie_Chubby.gltf';

const clips={walk:'Walk',run:'Run_Arms',attack:'Idle_Attack',hit:'HitReact',death:'Death',idle:'Idle'};
let templates;
export async function loadActors(){const loader=new GLTFLoader();templates=await Promise.all([loader.parseAsync(basicJSON,''),loader.parseAsync(bruteJSON,'')]);return templates.map(t=>t.animations.map(a=>a.name));}
export function createEnemyActor(kind){
 const template=templates[kind==='brute'?1:0],model=cloneSkeleton(template.scene),root=new THREE.Group();root.add(model);
 model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model),height=bounds.max.y-bounds.min.y,target=kind==='brute'?3.1:kind==='runner'?1.9:2.1;
 const s=target/height;model.scale.setScalar(s);model.position.y=-bounds.min.y*s;
 model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;o.userData.sharedAsset=true;o.material=o.material.clone();o.material.roughness=.82;o.material.metalness=.02;if(kind==='runner')o.material.color.multiply(new THREE.Color('#c6cda7'));if(o.material.map)o.material.map.anisotropy=4;}});
 const mixer=new THREE.AnimationMixer(model),actions={};for(const [state,name] of Object.entries(clips)){const clip=template.animations.find(c=>c.name===name);if(!clip)throw Error('Missing animation '+name);actions[state]=mixer.clipAction(clip);if(['attack','hit','death'].includes(state)){actions[state].setLoop(THREE.LoopOnce,1);actions[state].clampWhenFinished=true;}}
 let current=null;const controller={model,mixer,actions,height:target,state:'idle',play(state){if(current===actions[state])return;current?.fadeOut(.12);current=actions[state];current.reset().setEffectiveTimeScale(state==='run'?1.25:1).setEffectiveWeight(1).fadeIn(.12).play();controller.state=state;},update(dt){mixer.update(dt);},dispose(){mixer.stopAllAction();mixer.uncacheRoot(model);model.traverse(o=>{if(o.isMesh)o.material.dispose();});}};controller.play(kind==='runner'?'run':'walk');root.userData.actor=controller;return root;
}

// Volumetric playable body: camera orbit never turns the actor. The supplied
// photographic likeness is on the front of the head, never on the back.
export function createPlayableHero(atlas,index){
 const root=new THREE.Group(),body=new THREE.Group();root.add(body);
 const cloth=new THREE.MeshStandardMaterial({color:index?'#221b32':'#15191e',roughness:.85}),skin=new THREE.MeshStandardMaterial({color:'#c99777',roughness:.8}),hair=new THREE.MeshStandardMaterial({color:index?'#977047':'#65503a',roughness:.95}),bone=new THREE.MeshStandardMaterial({color:index?'#a26fd5':'#d6d8cd',roughness:.8});
 function ellipsoid(parent,x,y,z,sx,sy,sz,material){const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=true;parent.add(mesh);return mesh;}
 function limb(x,y,length,radius){const pivot=new THREE.Group(),lower=new THREE.Group();pivot.position.set(x,y,0);body.add(pivot);ellipsoid(pivot,0,-length*.25,0,radius,length*.28,radius,cloth);lower.position.y=-length*.5;pivot.add(lower);ellipsoid(lower,0,-length*.24,0,radius*.88,length*.28,radius*.88,cloth);ellipsoid(pivot,0,-length*.5,0,radius*.92,radius*.92,radius*.92,cloth);pivot.userData.lower=lower;return pivot;}

 ellipsoid(body,0,1.6,0,.36,.52,.22,cloth);ellipsoid(body,0,2.14,0,.13,.16,.13,skin);
 const head=new THREE.Group();head.position.y=2.42;body.add(head);ellipsoid(head,0,0,0,.29,.35,.25,skin);ellipsoid(head,0,.13,-.07,.30,.26,.24,hair);
 if(index){ellipsoid(head,-.26,-.17,-.1,.09,.41,.18,hair);ellipsoid(head,.26,-.17,-.1,.09,.41,.18,hair);const brim=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.035,32),cloth);brim.position.y=.30;head.add(brim);const hat=new THREE.Mesh(new THREE.ConeGeometry(.27,.64,24),cloth);hat.position.set(.04,.62,0);hat.rotation.z=-.15;head.add(hat);const skirt=new THREE.Mesh(new THREE.ConeGeometry(.59,.85,32,1,true),cloth);skirt.position.y=1.03;body.add(skirt);}
 const leftLeg=limb(-.18,1.12,.91,.13),rightLeg=limb(.18,1.12,.91,.13),leftArm=limb(-.43,1.99,.78,.105),rightArm=limb(.43,1.99,.78,.105);
 for(const leg of [leftLeg,rightLeg]){ellipsoid(leg.userData.lower,0,-.43,.09,.15,.13,.25,cloth);if(!index)ellipsoid(leg,0,-.42,-.125,.035,.34,.018,bone);}
 for(const arm of [leftArm,rightArm])ellipsoid(arm.userData.lower,0,-.39,0,.085,.11,.075,skin);
 for(const side of [-1,1])ellipsoid(body,side*.31,1.95,0,.17,.19,.18,cloth);
 ellipsoid(body,0,1.12,0,.29,.21,.19,cloth);
 if(!index){ellipsoid(body,0,1.65,.225,.025,.30,.018,bone);for(let i=0;i<6;i++)for(const side of [-1,1]){const rib=ellipsoid(body,side*.115,1.43+i*.085,.215,.14,.024,.025,bone);rib.rotation.z=side*.2;}for(const leg of [leftLeg,rightLeg])ellipsoid(leg,0,-.42,.125,.035,.34,.018,bone);}
 else{for(let i=0;i<5;i++)for(const side of [-1,1]){const lace=ellipsoid(body,0,1.47+i*.10,.23,.14,.012,.025,bone);lace.rotation.z=side*.4;}}
 const weaponMaterial=new THREE.MeshStandardMaterial({color:index?'#c7b7d8':'#749377',metalness:.65,roughness:.3});
 const weapon=new THREE.Mesh(new THREE.CylinderGeometry(index?.018:.065,index?.025:.08,index?.75:.44,12),weaponMaterial);weapon.position.set(0,-.32,.22);weapon.rotation.x=index?.2:Math.PI/2;rightArm.userData.lower.add(weapon);
 ellipsoid(rightArm.userData.lower,0,index?.06:-.32,index?.30:.45,index?.10:.06,index?.10:.06,index?.025:.06,bone);

 if(!index){ellipsoid(body,0,1.6,-.225,.035,.4,.018,bone);for(let i=0;i<6;i++)ellipsoid(body,0,1.39+i*.09,-.215,.25-i*.015,.018,.032,bone);}else{for(const x of [-1,1]){const ribbon=ellipsoid(body,x*.11,1.49,-.23,.025,.32,.018,bone);ribbon.rotation.z=x*.3;}}
 const texture=atlas.clone();texture.repeat.set(index?.091:.113,index?.19:.185);texture.offset.set(index?.685:.236,index?.704:.739);texture.needsUpdate=true;texture.userData.privateTexture=true;
 const face=new THREE.Mesh(new THREE.SphereGeometry(.29,24,16,Math.PI*.18,Math.PI*.64,Math.PI*.20,Math.PI*.65),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}));
 // Sphere's selected patch is on +Z; crop coordinates come from the hero atlas.
 face.scale.set(1,1.15,1);head.add(face);
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.48,24),new THREE.MeshBasicMaterial({color:'#020609',transparent:true,opacity:.3,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.025;root.add(shadow);
 root.userData.photoRig={index,mesh:body,bones:[leftLeg,rightLeg,leftArm,rightArm],volumetric:true,animate(time,moving,cast){const stride=Math.sin(time*9)*moving;leftLeg.rotation.x=stride*.6;rightLeg.rotation.x=-stride*.6;leftArm.rotation.x=-stride*.4;rightArm.rotation.x=stride*.4-cast*.9;leftLeg.userData.lower.rotation.x=Math.max(0,-stride)*.85;rightLeg.userData.lower.rotation.x=Math.max(0,stride)*.85;leftArm.userData.lower.rotation.x=-.22;rightArm.userData.lower.rotation.x=-.25-cast*.65;head.rotation.y=Math.sin(time*.7)*.04;body.position.y=Math.abs(stride)*.045+Math.sin(time*2)*.006;}};
 return root;
}
