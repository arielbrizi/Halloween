import * as THREE from 'three';
import recoleta from '../assets/photos/recoleta.jpg';
import obelisco from '../assets/photos/obelisco.jpg';
import caminito from '../assets/photos/caminito.jpg';
// Original, licensed Buenos Aires photographs. UV windows select architectural
// details; these are photo-textured recreations, not photogrammetric scans.
const urls=[recoleta,obelisco,caminito],textures=urls.map(url=>{
 const texture=new THREE.Texture();texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 const image=new Image();image.onload=()=>{const canvas=document.createElement('canvas'),scale=Math.min(1,1280/image.width,1280/image.height);canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);texture.image=canvas;texture.needsUpdate=true;};image.src=url;return texture;
});
const materials=new Map();
export function photoFacade(parent,index,x,y,z,width,height,angle,rect){
 const key=index;let material=materials.get(key);
 if(!material){material=new THREE.MeshStandardMaterial({map:textures[index],roughness:.9,color:'#dce2e6',side:THREE.DoubleSide});material.userData.sharedAsset=true;material.userData.photoSurface=true;materials.set(key,material);}
 const geometry=new THREE.PlaneGeometry(width,height),uv=geometry.attributes.uv;
 const [left,top,right,bottom]=rect;for(let i=0;i<uv.count;i++)uv.setXY(i,left+uv.getX(i)*(right-left),1-bottom+uv.getY(i)*(bottom-top));
 const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.rotation.y=angle;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
export const realPlacePhotos=urls;
