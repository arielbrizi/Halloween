export function createHaptics(){
 let enabled=true,last=-Infinity;try{enabled=localStorage.getItem('night-haptics')!=='off';}catch{}
 const supported=typeof navigator.vibrate==='function',button=document.getElementById('haptics');
 function label(){button.textContent=supported?`VIBRACIÓN ${enabled?'ON':'OFF'}`:'SIN VIBRACIÓN';button.setAttribute('aria-pressed',String(enabled&&supported));button.disabled=!supported;button.hidden=!supported;}
 function pulse(kind='shot'){if(!enabled||!supported||!matchMedia('(pointer:coarse)').matches)return false;const now=performance.now();if(kind==='shot'&&now-last<80)return false;if(kind==='shot')last=now;try{return navigator.vibrate(({shot:18,hit:28,hurt:[45,30,60],special:[25,25,65],tap:12})[kind]||12);}catch{return false;}}
 function stop(){if(supported)try{navigator.vibrate(0);}catch{}}
 button.onclick=()=>{enabled=!enabled;try{localStorage.setItem('night-haptics',enabled?'on':'off');}catch{}label();if(enabled)pulse('tap');else stop();};label();return {pulse,stop};
}
