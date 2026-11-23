import {create} from 'zustand';
/** Одна вкладка пишет, остальные только читают. Web Locks; без них — метка в localStorage с пульсом */
export type TabMode='own'|'ro';
export const useTab=create<{mode:TabMode}>()(()=>({mode:'own'}));
export const isOwner=()=>useTab.getState().mode==='own';
const setMode=(mode:TabMode)=>useTab.setState({mode});
interface Hooks{flush:()=>Promise<void>;adopt:()=>Promise<void>;lost:()=>void}
let H:Hooks={flush:async()=>{},adopt:async()=>{},lost:()=>{}};
export const bindTabs=(h:Hooks)=>{H=h};
const NAME='igp.owner',HB='igp.owner.hb',ME=Math.random().toString(36).slice(2)+Date.now().toString(36);
let ch:BroadcastChannel|null=null;
try{ch=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('igp'):null}catch{ch=null}
const hasLocks=()=>typeof navigator!=='undefined'&&!!navigator.locks&&typeof navigator.locks.request==='function';
const hold=()=>new Promise<void>(()=>{});/* держим блокировку, пока вкладка жива */
let beat:ReturnType<typeof setInterval>|null=null;
const lose=()=>{if(!isOwner())return;setMode('ro');H.lost()};
const readHb=():{id:string;ts:number}|null=>{try{return JSON.parse(localStorage.getItem(HB)||'null')}catch{return null}};
const writeHb=()=>{try{localStorage.setItem(HB,JSON.stringify({id:ME,ts:Date.now()}))}catch{/* память недоступна */}};
const startBeat=()=>{writeHb();if(beat)clearInterval(beat);beat=setInterval(()=>{const h=readHb();if(h&&h.id!==ME){if(beat)clearInterval(beat);beat=null;lose()}else writeHb()},2000)};
/** при запуске: стать главной вкладкой или открыться только для чтения */
export function claim():Promise<void>{
if(hasLocks())return new Promise<void>(res=>{
navigator.locks.request(NAME,{ifAvailable:true},lock=>{if(!lock){setMode('ro');res();return}setMode('own');res();return hold()}).catch(()=>lose())});
const h=readHb();
if(h&&h.id!==ME&&Date.now()-h.ts<5000){setMode('ro')}else{setMode('own');startBeat()}
return Promise.resolve()}
/** «Забрать управление»: просим главную вкладку дописать, берём блокировку, перечитываем данные */
export async function takeOver():Promise<void>{
await new Promise<void>(res=>{const to=setTimeout(done,900);function done(){clearTimeout(to);ch?.removeEventListener('message',on);res()}
function on(m:MessageEvent){if(m.data?.t==='flushed')done()}
if(!ch){done();return}ch.addEventListener('message',on);ch.postMessage({t:'ask',from:ME})});
if(hasLocks()){await new Promise<void>(res=>{navigator.locks.request(NAME,{steal:true},lock=>{if(lock){setMode('own');res()}return hold()}).catch(()=>{lose()});setTimeout(res,1500)})}
else{setMode('own');startBeat()}
await H.adopt()}
if(typeof window!=='undefined'){
ch?.addEventListener('message',e=>{if(e.data?.t==='ask'&&e.data.from!==ME&&isOwner())H.flush().finally(()=>ch?.postMessage({t:'flushed',from:ME}))});
const out=()=>{if(isOwner())void H.flush()};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')out()});
addEventListener('pagehide',()=>{out();if(!hasLocks()&&isOwner()){const h=readHb();if(h?.id===ME){try{localStorage.removeItem(HB)}catch{/* память недоступна */}}}});
}
