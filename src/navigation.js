import {inside} from './geography.js';
export function createNavigation(obstacles,polygons,spawn){
 const N=111,step=.8,half=55,size=N*N,walk=new Uint8Array(size),dist=new Int16Array(size),queue=new Int32Array(size);
 function canMove(x,z){return Math.abs(x)<44&&Math.abs(z)<44&&!obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.r+.35)&&!polygons.some(o=>x>=o.minX-.3&&x<=o.maxX+.3&&z>=o.minZ-.3&&z<=o.maxZ+.3&&inside(x,z,o.points));}
 function index(x,z){const ix=Math.round(x/step)+half,iz=Math.round(z/step)+half;return ix<0||iz<0||ix>=N||iz>=N?-1:iz*N+ix;}
 for(let z=0;z<N;z++)for(let x=0;x<N;x++)walk[z*N+x]=canMove((x-half)*step,(z-half)*step)?1:0;
 function refresh(x,z){dist.fill(-1);let start=index(x,z);if(start<0)return;if(!walk[start]){let best=-1,closest=Infinity;for(let dz=-3;dz<=3;dz++)for(let dx=-3;dx<=3;dx++){const q=start+dz*N+dx;if(q>=0&&q<size&&walk[q]&&dx*dx+dz*dz<closest){best=q;closest=dx*dx+dz*dz;}}if(best<0)return;start=best;}let head=0,tail=1;queue[0]=start;dist[start]=0;while(head<tail){const at=queue[head++],col=at%N;for(const q of [col>0?at-1:-1,col<N-1?at+1:-1,at-N,at+N])if(q>=0&&q<size&&walk[q]&&dist[q]<0){dist[q]=dist[at]+1;queue[tail++]=q;}}}
 function advance(e,target,dt){let tx=target.x,tz=target.z;const at=index(e.x,e.z);if(Math.hypot(tx-e.x,tz-e.z)>1.5&&at>=0){let best=at,col=at%N;for(const q of [col>0?at-1:-1,col<N-1?at+1:-1,at-N,at+N])if(q>=0&&q<size&&dist[q]>=0&&(dist[best]<0||dist[q]<dist[best]))best=q;if(dist[best]>=0){tx=(best%N-half)*step;tz=(Math.floor(best/N)-half)*step;}}const dx=tx-e.x,dz=tz-e.z,d=Math.hypot(dx,dz)||1,nx=e.x+dx/d*e.speed*dt,nz=e.z+dz/d*e.speed*dt;if(canMove(nx,e.z))e.x=nx;if(canMove(e.x,nz))e.z=nz;}
 refresh(spawn.x,spawn.z);return {canMove,index,refresh,advance,walk,dist,N};
}
