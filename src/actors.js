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

// A segmented photographic rig keeps the supplied likeness readable. The body is
// intentionally 2.5D; the enemy rigs and first-person arms are fully volumetric.
export function createPhotoCompanion(atlas,index){
 const root=new THREE.Group(),texture=atlas.clone();texture.repeat.set(.5,1);texture.offset.set(index*.5,0);texture.needsUpdate=true;texture.userData.privateTexture=true;
 const geometry=new THREE.PlaneGeometry(2.1,2.8,20,36);geometry.translate(0,1.4,0);
 const bones=[new THREE.Bone(),new THREE.Bone(),new THREE.Bone(),new THREE.Bone(),new THREE.Bone()];bones[0].add(bones[1],bones[2],bones[3],bones[4]);bones[1].position.set(-.28,.85,0);bones[2].position.set(.28,.85,0);bones[3].position.set(-.52,1.9,0);bones[4].position.set(.52,1.9,0);
 const skin=[],weights=[],p=geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);let bone=0;if(y<1.15)bone=x<0?1:2;else if(y<2&&Math.abs(x)>.5)bone=x<0?3:4;const weight=bone===0?1:Math.min(1,Math.max(0,(bone<3?1.15-y:Math.abs(x)-.4)*3));skin.push(bone,0,0,0);weights.push(weight,1-weight,0,0);}
 geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(skin,4));geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
 const mesh=new THREE.SkinnedMesh(geometry,new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.45,side:THREE.DoubleSide,toneMapped:false}));mesh.add(bones[0]);mesh.bind(new THREE.Skeleton(bones));mesh.frustumCulled=false;root.add(mesh);
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.5,24),new THREE.MeshBasicMaterial({color:0x04090e,transparent:true,opacity:.45,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.025;root.add(shadow);
 root.userData.photoRig={bones,mesh,index,animate(time,moving,cast){const stride=Math.sin(time*9)*moving;bones[1].rotation.z=stride*.09;bones[2].rotation.z=-stride*.09;bones[3].rotation.z=-stride*.04+cast*.15;bones[4].rotation.z=stride*.04-cast*.4;mesh.position.y=Math.abs(stride)*.055;}};
 return root;
}
