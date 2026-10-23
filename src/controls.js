// First-person input: mouse capture with drag fallback, independent touch pointers,
// keyboard and standard gamepads. UI buttons never trigger a weapon shot.
export function createControls({canvas,active,pause}) {
  const keys=new Set(),moveStick={x:0,y:0};
  const state={yaw:0,pitch:0,x:0,forward:0,firing:false,aiming:false,sprinting:false,crouching:false,fireHeld:false,jump:false,dash:false,special:false,reload:false,flashlight:false,lookEvents:0,locked:false};
  let mouseFire=false,touchFire=false,lookPointer=null,stickPointer=null,lastX=0,lastY=0,previousButtons=[];
  const $=id=>document.getElementById(id),hint=$('lookHint');
  const fine=()=>matchMedia('(pointer:fine)').matches;
  function look(dx,dy,sensitivity=.0024){state.yaw-=dx*sensitivity;state.pitch=Math.max(-1.35,Math.min(1.35,state.pitch-dy*sensitivity));state.lookEvents++;}
  async function lock(){if(!fine()||!active())return;try{await canvas.requestPointerLock?.();}catch{hint.querySelector('span').textContent='Arrastrá para mirar · X para disparar';hint.hidden=false;}}
  document.addEventListener('pointerlockchange',()=>{const was=state.locked;state.locked=document.pointerLockElement===canvas;hint.hidden=state.locked||!fine();if(was&&!state.locked&&active())pause();});
  document.addEventListener('pointerlockerror',()=>{hint.querySelector('span').textContent='Arrastrá para mirar · X para disparar';hint.hidden=false;});
  document.addEventListener('mousemove',e=>{if(active()&&state.locked)look(e.movementX,e.movementY);});
  window.addEventListener('keydown',e=>{if((e.code==='KeyP'||e.code==='Escape')&&!e.repeat){pause();return;}if(!active())return;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.repeat)return;const map={Space:'jump',KeyQ:'dash',KeyE:'special',KeyR:'reload',KeyF:'flashlight'};if(map[e.code])state[map[e.code]]=true;});
  window.addEventListener('keyup',e=>keys.delete(e.code));
  const zone=$('lookZone');
  zone.addEventListener('pointerdown',e=>{if(!active())return;if(e.pointerType==='mouse'){if(e.button===0){mouseFire=true;lock();}if(e.button===2)state.aiming=true;}lookPointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;zone.setPointerCapture(e.pointerId);});
  zone.addEventListener('pointermove',e=>{if(!active()||e.pointerId!==lookPointer||state.locked)return;look(e.clientX-lastX,e.clientY-lastY,e.pointerType==='touch'?.0045:.003);lastX=e.clientX;lastY=e.clientY;});
  function releaseLook(e){if(e.pointerId===lookPointer)lookPointer=null;if(e.pointerType==='mouse'){mouseFire=false;state.aiming=false;}}
  zone.addEventListener('pointerup',releaseLook);zone.addEventListener('pointercancel',releaseLook);
  document.addEventListener('mousedown',e=>{if(!active()||!state.locked)return;if(e.target.closest?.('button,select,a,input'))return;if(e.button===0)mouseFire=true;if(e.button===2)state.aiming=true;});
  document.addEventListener('mouseup',e=>{if(e.button===0)mouseFire=false;if(e.button===2)state.aiming=false;});
  canvas.addEventListener('click',()=>lock());zone.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('contextmenu',e=>e.preventDefault());
  $('capture').onclick=lock;
  const stick=$('stick');
  function dragStick(e){const r=stick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,d=Math.hypot(dx,dy),s=Math.min(d,36);moveStick.x=d?dx/d*s/36:0;moveStick.y=d?dy/d*s/36:0;$('knob').style.transform=`translate(${moveStick.x*30}px,${moveStick.y*30}px)`;}
  stick.onpointerdown=e=>{e.preventDefault();if(!active())return;stickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);dragStick(e);};
  stick.onpointermove=e=>{if(e.pointerId===stickPointer)dragStick(e);};
  stick.onpointerup=stick.onpointercancel=()=>{stickPointer=null;moveStick.x=moveStick.y=0;$('knob').style.transform='';};
  const fire=$('fire');fire.onpointerdown=e=>{e.preventDefault();if(!active())return;fire.setPointerCapture(e.pointerId);touchFire=true;};fire.onpointerup=fire.onpointercancel=()=>{touchFire=false;};
  for(const [id,action] of [['jump','jump'],['dash','dash'],['special','special'],['reload','reload'],['flashlight','flashlight']])$(id).onclick=()=>{if(active())state[action]=true;};
  const deadzone=x=>Math.abs(x)<.17?0:(x-Math.sign(x)*.17)/.83;
  function update(dt){if(!active())return;state.x=moveStick.x+(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0);state.forward=-moveStick.y+(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0);state.yaw+=((keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0))*dt*1.8;state.sprinting=keys.has('ShiftLeft')||keys.has('ShiftRight');state.crouching=keys.has('ControlLeft')||keys.has('KeyC');state.firing=mouseFire||touchFire||keys.has('KeyX');const pad=navigator.getGamepads?.()?.find(p=>p?.connected);if(pad){state.x+=deadzone(pad.axes[0]||0);state.forward-=deadzone(pad.axes[1]||0);look(deadzone(pad.axes[2]||0)*dt*900,deadzone(pad.axes[3]||0)*dt*650);state.firing||=!!pad.buttons[7]?.pressed;state.aiming=!!pad.buttons[6]?.pressed;state.sprinting||=!!pad.buttons[10]?.pressed;for(const [index,action] of [[0,'jump'],[2,'reload'],[4,'special'],[5,'dash']])if(pad.buttons[index]?.pressed&&!previousButtons[index])state[action]=true;if(pad.buttons[9]?.pressed&&!previousButtons[9])pause();previousButtons=pad.buttons.map(b=>b.pressed);}const length=Math.hypot(state.x,state.forward);if(length>1){state.x/=length;state.forward/=length;}}
  function reset(){keys.clear();moveStick.x=moveStick.y=0;stickPointer=lookPointer=null;mouseFire=touchFire=false;state.x=state.forward=0;state.firing=state.aiming=state.sprinting=state.crouching=false;for(const k of ['jump','dash','special','reload','flashlight'])state[k]=false;$('knob').style.transform='';}
  return {state,update,reset,lock,unlock(){if(document.pointerLockElement===canvas)document.exitPointerLock();},setDirection(yaw=0,pitch=0){state.yaw=yaw;state.pitch=pitch;},consume(key){const result=state[key];state[key]=false;return result;}};
}
