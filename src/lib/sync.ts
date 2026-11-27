// Синхронизация библиотеки шаблонов между устройствами. Сайт статичный, своего сервера нет,
// поэтому копия лежит в приватном Gist на GitHub владельца. Содержимое зашифровано ключом из токена,
// токен хранится на устройстве под ПИН-кодом. Изменение уходит через ~1 с, другие устройства подхватывают за ~15 с или сразу при возврате на вкладку.
import {create} from 'zustand';
import {useStore} from '../store';
import {b64,unb64,keyFrom} from './crypto';
import {saveSecret,loadSecret,dropSecret} from './vault';
import {isOwner} from './tabs';
import {payloadOf,sigD,sigP} from './tplLib';
import type {TplPayload} from './tplLib';

interface Cfg{token:string;id:string}
export type SyncSt='off'|'idle'|'sync'|'err';
export const useSync=create<{st:SyncSt;last:number;err:string;gist:string}>()(()=>({st:'off',last:0,err:'',gist:''}));
const set=(p:Partial<ReturnType<typeof useSync.getState>>)=>useSync.setState(p);

const API='https://api.github.com/gists',FILE='ig-templates.bin',SALT=new TextEncoder().encode('ig_prototype/tpl-sync/v1');
let cfg:Cfg|null=null,etag:string|null=null,lastSig='',timer:ReturnType<typeof setTimeout>|null=null,poll:ReturnType<typeof setInterval>|null=null,chain:Promise<void>=Promise.resolve(),unsub:(()=>void)|null=null,keyP:Promise<CryptoKey>|null=null,keyFor='';

const hdr=(c:Cfg,extra:Record<string,string>={}):Record<string,string>=>({Authorization:'Bearer '+c.token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...extra});
const key=(c:Cfg)=>{if(!keyP||keyFor!==c.token){keyFor=c.token;keyP=keyFrom(c.token,SALT)}return keyP};
const enc=new TextEncoder(),dec=new TextDecoder();
const gz=async(u:Uint8Array,mode:'c'|'d')=>{if(typeof CompressionStream==='undefined')throw new Error('Браузер не умеет сжатие');const s=new Blob([u as BlobPart]).stream().pipeThrough(mode==='c'?new CompressionStream('gzip'):new DecompressionStream('gzip'));return new Uint8Array(await new Response(s).arrayBuffer())};
async function pack(c:Cfg,p:TplPayload){const raw=enc.encode(JSON.stringify(p));let z=false,body=raw;try{body=await gz(raw,'c');z=true}catch{/* без сжатия */}
const iv=crypto.getRandomValues(new Uint8Array(new ArrayBuffer(12)));const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(c),body as BufferSource));return(z?'z1.':'p1.')+b64(iv)+'.'+b64(ct)}
async function unpack(c:Cfg,t:string):Promise<TplPayload>{const [f,i,d]=t.trim().split('.');if((f!=='z1'&&f!=='p1')||!i||!d)throw new Error('Файл синхронизации не распознан');
let body=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(i)},await key(c),unb64(d)));if(f==='z1')body=await gz(body,'d');const p=JSON.parse(dec.decode(body)) as TplPayload;if(!p||p.v!==1||!Array.isArray(p.tpls))throw new Error('Файл синхронизации повреждён');return p}

class SyncErr extends Error{constructor(m:string,public fatal=false){super(m)}}
const fail=async(r:Response):Promise<never>=>{if(r.status===401)throw new SyncErr('Токен не подошёл: создай новый с правом gist',true);if(r.status===403||r.status===429)throw new SyncErr('GitHub просит подождать, повтор через минуту');if(r.status===404)throw new SyncErr('Gist не найден: проверь код подключения',true);throw new SyncErr('GitHub ответил ошибкой '+r.status)};
const net=async<T,>(f:()=>Promise<T>):Promise<T>=>{try{return await f()}catch(e){if(e instanceof SyncErr)throw e;if(e instanceof TypeError)throw new SyncErr('Нет связи с GitHub');throw e}};

/** скачать копию; при 304 ничего не изменилось */
async function pull(c:Cfg,force:boolean):Promise<{p:TplPayload|null;same:boolean}>{return net(async()=>{
const r=await fetch(API+'/'+c.id,{headers:hdr(c,etag&&!force?{'If-None-Match':etag}:{}),cache:'no-store'});
if(r.status===304)return{p:null,same:true};if(!r.ok)return fail(r);
const j=await r.json() as {files?:Record<string,{content?:string;truncated?:boolean;raw_url?:string}>};etag=r.headers.get('ETag');
const f=j.files?.[FILE];if(!f)return{p:null,same:false};
let txt=f.content??'';if(f.truncated&&f.raw_url){const rr=await fetch(f.raw_url,{cache:'no-store'});if(!rr.ok)return fail(rr);txt=await rr.text()}
if(!txt.trim())return{p:null,same:false};
try{return{p:await unpack(c,txt),same:false}}catch(e){if(e instanceof SyncErr)throw e;throw new SyncErr('Не удалось расшифровать копию: токен от другого Gist?',true)}})}

async function push(c:Cfg){const d=useStore.getState().data;if(!d)return;const content=await pack(c,payloadOf(d));
await net(async()=>{const r=await fetch(API+'/'+c.id,{method:'PATCH',headers:hdr(c,{'Content-Type':'application/json'}),body:JSON.stringify({files:{[FILE]:{content}}})});if(!r.ok)return fail(r);etag=r.headers.get('ETag')})}

async function once(force=false){const c=cfg;if(!c||!isOwner())return;const my=c;set({st:'sync',err:''});
try{const r=await pull(c,force);if(cfg!==my)return;
if(r.p)useStore.getState().mergeTpls(r.p);
const d=useStore.getState().data;if(!d)return;const ls=sigD(d);
const need=r.p?ls!==sigP(r.p):r.same?ls!==lastSig:true;
if(need)await push(c);lastSig=ls;set({st:'idle',last:Date.now(),err:''})}
catch(e){const m=e instanceof Error?e.message:'Ошибка синхронизации';if(e instanceof SyncErr&&e.fatal)stopTimers();set({st:'err',err:m})}}
/** одна синхронизация за раз */
export const syncNow=(force=false)=>{chain=chain.then(()=>once(force));return chain};
const later=(ms:number)=>{if(timer)clearTimeout(timer);timer=setTimeout(()=>{timer=null;void syncNow()},ms)};
const stopTimers=()=>{if(timer)clearTimeout(timer);timer=null;if(poll)clearInterval(poll);poll=null;if(unsub)unsub();unsub=null;document.removeEventListener('visibilitychange',onVis);window.removeEventListener('focus',onFocus);window.removeEventListener('online',onFocus)};
const onVis=()=>{if(document.visibilityState==='visible')void syncNow()};const onFocus=()=>{void syncNow()};

function run(c:Cfg){stopTimers();cfg=c;etag=null;lastSig='';set({st:'sync',gist:c.id,err:''});
unsub=useStore.subscribe((s,p)=>{if(s.data===p.data||!s.data)return;if(s.data.blockTpls===p.data?.blockTpls&&s.data.tplMeta===p.data?.tplMeta)return;if(sigD(s.data)!==lastSig)later(900)});
poll=setInterval(()=>{if(document.visibilityState==='visible')void syncNow()},15000);
document.addEventListener('visibilitychange',onVis);window.addEventListener('focus',onFocus);window.addEventListener('online',onFocus);
void syncNow(true)}

/** код подключения: по нему включают синхронизацию на другом устройстве */
export const codeOf=()=>cfg?'igs1.'+btoa(cfg.token+'|'+cfg.id):'';
const parseCode=(t:string):Cfg|null=>{const s=t.trim();if(!s.startsWith('igs1.'))return null;try{const [token,id]=atob(s.slice(5)).split('|');return token&&id?{token,id}:null}catch{return null}};

/** при запуске: если синхронизация была включена, продолжить */
export async function startSync(){const c=await loadSecret<Cfg>('sync');if(c?.token&&c.id)run(c)}
export function stopSync(){stopTimers();cfg=null;set({st:'off',gist:'',err:''})}
/** включить: токен (создаст новый Gist) или код подключения с другого устройства */
export async function connect(input:string){const t=input.trim();if(!t)throw new Error('Вставь токен или код подключения');
let c=parseCode(t);
if(!c){const tk:Cfg={token:t,id:''};const content=await pack(tk,payloadOf(useStore.getState().data!));
const r=await net(()=>fetch(API,{method:'POST',headers:hdr(tk,{'Content-Type':'application/json'}),body:JSON.stringify({description:'ig_prototype: шаблоны (зашифрованы)',public:false,files:{[FILE]:{content}}})}));
if(!r.ok)await fail(r);const j=await r.json() as {id:string};c={token:t,id:j.id}}
else{const r=await net(()=>fetch(API+'/'+c!.id,{headers:hdr(c!)}));if(!r.ok)await fail(r)}
await saveSecret('sync',c);run(c)}
export async function disconnect(){stopSync();dropSecret('sync')}
