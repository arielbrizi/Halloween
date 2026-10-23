import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {existsSync} from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';

// The test-only entry exposes fixtures, never shipped in index.html. World time is
// advanced deterministically so WebGL software rendering cannot hide logic bugs.
const fixture=`
window.__test={
 step(count=1,dt=.02){for(let i=0;i<count;i++)if(running&&!paused)update(dt);},
 state:()=>({player,stats,enemies,buddy}),
 clear(){for(const e of enemies)removeObject(entities,e.mesh);enemies=[];spawnClock=100;buddy.shotClock=100;},
 encounter({x=0,z=6,hp=2,kind='zombie'}={}){spawnEnemy(kind==='brute');const e=enemies.at(-1);if(!e)throw Error('No reachable spawn');e.x=x;e.z=z;e.hp=hp;e.max=hp;e.cooldown=0;e.mesh.position.set(x,0,z);spawnClock=100;buddy.shotClock=100;return e.height;},
 position(x=0,z=10,yaw=0,pitch=0){player.x=x;player.z=z;player.y=0;player.vy=0;controls.setDirection(yaw,pitch);setCamera(0);},
 replenish(){player.ammo=player.capacity;player.reload=0;shotClock=0;},
 resetDamage(){player.hp=player.max;player.inv=0;player.y=0;player.vy=0;},
 enemyAnimation(){const e=enemies[0];if(!e)return null;const bones=[];e.mesh.traverse(o=>{if(o.isBone)bones.push(...o.quaternion.toArray());});return {bones,time:e.mesh.userData.actor.mixer.time,state:e.mesh.userData.actor.state,passable:nav.canMove(e.x,e.z)};},
 finishWave(){for(const e of enemies)removeObject(entities,e.mesh);enemies=[];defeated=spawned=quota();bossSpawned=true;update(.02);},
 hurt(){player.hp=1;player.inv=0;player.y=0;player.vy=0;this.clear();this.encounter({x:player.x,z:player.z,hp:100});},
 draw(){window.__queuedFrame?.(performance.now());},
 diagnostics:()=>__nightDiagnostics()
};`;
const source=await readFile('src/main.js','utf8');
const bundle=await build({stdin:{contents:source+fixture,sourcefile:'fps-test-entry.js',resolveDir:join(process.cwd(),'src')},bundle:true,format:'iife',write:false,minify:true,loader:{'.png':'dataurl','.jpg':'dataurl','.gltf':'text'},target:'es2020'});
let html=await readFile('index.html','utf8');html=html.replace(/<script>[\s\S]*<\/script>/,()=>'<script>'+bundle.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')+'</script>');
const temporary=await mkdtemp(join(tmpdir(),'night-fps-tests-'));
const evidence=process.env.TEST_ARTIFACTS_DIR||temporary;if(process.env.TEST_ARTIFACTS_DIR){const {mkdir}=await import('node:fs/promises');await mkdir(evidence,{recursive:true});}
const executablePath=process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
const browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
after(async()=>{await browser.close();await rm(temporary,{recursive:true,force:true});});
async function pageFor(mobile=false){const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1100,height:760},offline:true,isMobile:mobile,hasTouch:mobile});const page=await context.newPage();const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().startsWith('http'))requests.push(r.url());});await page.evaluate(()=>{window.requestAnimationFrame=fn=>{window.__queuedFrame=fn;return 1;};HTMLCanvasElement.prototype.requestPointerLock=()=>Promise.reject(new DOMException('Testing drag fallback','NotAllowedError'));});await page.setContent(html,{waitUntil:'load',timeout:120000});await page.locator('#loading').waitFor({state:'hidden',timeout:120000});await page.selectOption('#graphics','performance');return {context,page,errors,requests};}
const step=(p,count=1)=>p.evaluate(n=>__test.step(n),count);
const state=p=>p.evaluate(()=>__nightDiagnostics());
async function key(p,name,count=1){await p.keyboard.down(name);await step(p,count);await p.keyboard.up(name);}

test('FPS: faces, relative controls, jump, sprint, manual fire, reload, headshots and wall occlusion', {timeout:180000},async()=>{
 const {context,page:p,errors,requests}=await pageFor();await p.selectOption('#place','1');await p.click('#play');await p.click('#camera');let d=await state(p);assert.equal(d.hero,'Nahue');assert.equal(d.buddy.name,'Delfi');assert.equal(d.eyeY,1.68);assert(d.firstPerson&&d.buddy.rigged&&d.bothFaces);
 assert(await p.locator('#teamPanel img').evaluateAll(a=>a.every(i=>i.complete&&i.naturalWidth>0)));
 await key(p,'KeyW',10);assert((await state(p)).z<10);const oldYaw=(await state(p)).yaw;await key(p,'ArrowRight',12);assert((await state(p)).yaw<oldYaw);const x=(await state(p)).x;await key(p,'KeyW',10);assert((await state(p)).x>x);
 const zone=await p.locator('#lookZone').boundingBox();const yaw=(await state(p)).yaw;await p.mouse.move(zone.width*.7,zone.height*.45);await p.mouse.down();await p.mouse.move(zone.width*.7+35,zone.height*.45-15);await p.mouse.up();assert.notEqual((await state(p)).yaw,yaw);
 await p.evaluate(()=>__test.position());await key(p,'Space',10);assert((await state(p)).eyeY>1.9);await step(p,60);assert.equal((await state(p)).eyeY,1.68);
 await p.keyboard.down('ShiftLeft');await key(p,'KeyW',15);await p.keyboard.up('ShiftLeft');assert((await state(p)).stamina<100);
 await p.evaluate(()=>{__test.clear();__test.position();__test.replenish();});const ammo=(await state(p)).ammo;await key(p,'KeyX',15);assert((await state(p)).shots>0);assert((await state(p)).ammo<ammo);await key(p,'KeyR');assert((await state(p)).reloading);await step(p,80);assert.equal((await state(p)).ammo,ammo);assert(!(await state(p)).reloading);
 await p.evaluate(()=>{__test.clear();__test.position(0,10,0,Math.atan2(2.1*.89-1.68,4));__test.replenish();__test.encounter();});const kills=(await state(p)).kills;await key(p,'KeyX');assert((await state(p)).kills>kills);assert((await state(p)).headshots>0);
 await p.evaluate(()=>{__test.clear();__test.position(0,10,0,0);__test.replenish();__test.encounter({x:0,z:-8,hp:10});});await key(p,'KeyX');assert.equal(await p.evaluate(()=>__test.state().enemies[0].hp),10,'Obelisk blocks the shot');
 await p.evaluate(()=>__test.draw());await p.screenshot({path:join(evidence,'desktop-fps.png')});assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);await context.close();
});

test('Animated rigs: walking pose, wind-up attack, special, death, team progression and restart',{timeout:180000},async()=>{
 const {context,page:p,errors}=await pageFor();await p.selectOption('#place','1');await p.click('#play');await p.click('#camera');await p.evaluate(()=>{__test.clear();__test.position();__test.encounter({x:-2,z:6,hp:20});});const before=await p.evaluate(()=>__test.enemyAnimation());await step(p,15);const afterPose=await p.evaluate(()=>__test.enemyAnimation());assert(afterPose.time>before.time);assert.notDeepEqual(afterPose.bones,before.bones);assert(afterPose.passable);assert.equal(afterPose.state,'walk');await p.evaluate(()=>__test.draw());await p.screenshot({path:join(evidence,'animated-enemy.png')});
 await p.evaluate(()=>{__test.clear();__test.position();__test.resetDamage();__test.encounter({x:0,z:9,hp:100});});await step(p);assert.equal((await state(p)).hp,140);assert.equal((await state(p)).animationStates[0],'attack');await step(p,30);assert((await state(p)).hp<140);
 await key(p,'KeyE');assert(await p.evaluate(()=>__test.state().player.specialCd>0));await p.keyboard.press('KeyP');const frozen=await state(p);await key(p,'KeyX',5);assert.equal((await state(p)).shots,frozen.shots);assert((await state(p)).paused);await p.click('#resume');
 for(let w=1;w<=9;w++){await p.evaluate(()=>__test.finishWave());if(w===9){assert.equal((await state(p)).mode,'win');break;}await p.locator('.upgrade').first().click();assert.equal((await state(p)).wave,w+1);assert.equal((await state(p)).district,(1+Math.floor(w/3))%3);}
 assert((await p.locator('#modalTitle').textContent()).includes('Delfi y Nahue'));await p.click('#resume');assert.equal((await state(p)).wave,1);await p.evaluate(()=>__test.hurt());await step(p,60);assert.equal((await state(p)).mode,'dead');await p.click('#resume');assert.equal((await state(p)).hp,140);await p.keyboard.press('KeyP');await p.click('#back');assert(await p.locator('#menu').isVisible());assert.deepEqual(errors,[]);await context.close();
});

test('Mobile: Delfi/Nahue identity and simultaneous joystick, looking, firing, reload and jump',{timeout:180000},async()=>{
 const {context,page:p,errors,requests}=await pageFor(true);await p.click('[data-hero="1"]');await p.selectOption('#place','1');await p.click('#play');await p.click('#camera');assert.equal((await state(p)).hero,'Delfi');assert.equal((await state(p)).buddy.name,'Nahue');assert.equal((await state(p)).capacity,16);
 const cd=await context.newCDPSession(p),s=await p.locator('#stick').boundingBox(),f=await p.locator('#fire').boundingBox();const p1={id:1,x:s.x+s.width/2,y:s.y+s.height/2},p2={id:2,x:290,y:360},p3={id:3,x:f.x+f.width/2,y:f.y+f.height/2};
 await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p1,p2,p3]});await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...p1,x:p1.x+29},{...p2,x:p2.x+34,y:p2.y-12},p3]});const initial=await state(p);await step(p,20);let moved=await state(p);assert.notEqual(moved.x,initial.x);assert.notEqual(moved.yaw,0);assert(moved.shots>0);await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await step(p,2);const stopped=await state(p);await step(p,10);assert.equal((await state(p)).x,stopped.x);
 await p.tap('#reload');await step(p,80);assert.equal((await state(p)).ammo,16);await p.tap('#jump');await step(p,8);assert((await state(p)).eyeY>1.9);await p.tap('#special');await step(p,2);assert(await p.evaluate(()=>__test.state().player.specialCd>0));await p.evaluate(()=>__test.draw());await p.screenshot({path:join(evidence,'mobile-fps.png')});assert(await p.locator('#teamPanel img').evaluateAll(a=>a.every(i=>i.complete&&i.naturalWidth>0)));assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);await context.close();
});


test('Standard gamepad mapping and high graphics render without external requests',{timeout:180000},async()=>{
 const {context,page:p,errors,requests}=await pageFor();await p.selectOption('#place','1');await p.selectOption('#graphics','high');await p.click('#play');await p.click('#camera');await p.evaluate(()=>{window.testPad={connected:true,mapping:'standard',axes:[.7,0,.5,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[window.testPad]});window.testPad.buttons[7].pressed=true;});const initial=await state(p);await step(p,15);const moved=await state(p);assert.notEqual(moved.x,initial.x);assert.notEqual(moved.yaw,initial.yaw);assert(moved.shots>initial.shots);await p.evaluate(()=>{window.testPad.buttons[7].pressed=false;window.testPad.buttons[2].pressed=true;});await step(p,2);assert((await state(p)).reloading);await p.evaluate(()=>__test.draw());assert((await state(p)).postProcessing);await p.screenshot({path:join(evidence,'high-graphics.png')});assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);await context.close();
});


test('Selected character is fully visible by default, animates and switches views on desktop and mobile',{timeout:180000},async()=>{
 for(const [mobile,hero,name,partner] of [[false,0,'Nahue','Delfi'],[true,1,'Delfi','Nahue']]){
  const {context,page:p,errors}=await pageFor(mobile);await p.selectOption('#place','1');await p.click(`[data-hero="${hero}"]`);await p.click('#play');let d=await state(p);assert(d.thirdPerson&&!d.firstPerson);assert.equal(d.selectedAvatar.name,name);assert(d.selectedAvatar.visible&&d.selectedAvatar.rigged);assert.equal(d.buddy.name,partner);const oldZ=d.selectedAvatar.z;await key(p,'KeyW',12);d=await state(p);assert(d.selectedAvatar.z<oldZ);assert.equal(d.selectedAvatar.z,d.z);await p.evaluate(()=>__test.draw());await p.screenshot({path:join(evidence,mobile?'third-person-mobile.png':'third-person-desktop.png')});
  if(mobile)await p.tap('#camera');else await p.keyboard.press('KeyV');assert((await state(p)).firstPerson);assert(!(await state(p)).selectedAvatar.visible);if(mobile)await p.tap('#camera');else await p.keyboard.press('KeyV');assert((await state(p)).thirdPerson);assert((await state(p)).selectedAvatar.visible);await key(p,'KeyX',12);assert((await state(p)).shots>0);assert.deepEqual(errors,[]);await context.close();
 }
});
