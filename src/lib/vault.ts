import {keyFrom,seal,unseal,b64,unb64} from './crypto';
let key:CryptoKey|null=null;
export const hasVault=()=>!!localStorage.getItem('igp.data');
export async function createVault(pin:string,data:unknown){const salt=crypto.getRandomValues(new Uint8Array(16));localStorage.setItem('igp.salt',b64(salt));key=await keyFrom(pin,salt);await save(data)}
export async function unlockVault(pin:string){const k=await keyFrom(pin,unb64(localStorage.getItem('igp.salt')!));try{const d=await unseal(k,localStorage.getItem('igp.data')!);key=k;return d}catch{return null}}
export async function save(data:unknown){if(key)localStorage.setItem('igp.data',await seal(key,data))}
export const lock=()=>{key=null};
/** копия из памяти (свежая, даже если запись в браузер не удалась); без ключа берёт то, что лежит в хранилище */
export async function exportCurrent(data:unknown){if(!key||!data)return exportBackup();return JSON.stringify({app:'ig_prototype',v:1,salt:localStorage.getItem('igp.salt'),data:await seal(key,data)})}
/** перечитать данные из хранилища (после захвата управления: другая вкладка могла записать новее) */
export async function reread(){if(!key)return null;try{const t=localStorage.getItem('igp.data');return t?await unseal(key,t):null}catch{return null}}
/** true, если запись упала из-за нехватки места */
export const isQuota=(e:unknown)=>{const x=e as {name?:string;code?:number}|null;return !!x&&(x.name==='QuotaExceededError'||x.name==='NS_ERROR_DOM_QUOTA_REACHED'||x.code===22||x.code===1014)};
export const exportBackup=()=>JSON.stringify({app:'ig_prototype',v:1,salt:localStorage.getItem('igp.salt'),data:localStorage.getItem('igp.data')});
export function importBackup(t:string){const j=JSON.parse(t);if(j.app!=='ig_prototype')throw new Error('bad');localStorage.setItem('igp.salt',j.salt);localStorage.setItem('igp.data',j.data)}
// --- device memory: non-extractable AES key kept in IndexedDB (no PIN on this device) ---
const idb=()=>new Promise<IDBDatabase>((res,rej)=>{const r=indexedDB.open('igp',1);r.onupgradeneeded=()=>r.result.createObjectStore('k');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const kv=async(m:IDBTransactionMode,f:(s:IDBObjectStore)=>IDBRequest):Promise<any>=>{const db=await idb();return new Promise((res,rej)=>{const r=f(db.transaction('k',m).objectStore('k'));r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})};
export const rememberDevice=async()=>{if(key)await kv('readwrite',s=>s.put(key,'dev'))};
export const forgetDevice=()=>kv('readwrite',s=>s.delete('dev')).catch(()=>{});
export async function autoUnlock(){try{const k=await kv('readonly',s=>s.get('dev'));if(!k||!hasVault())return null;const d=await unseal(k,localStorage.getItem('igp.data')!);key=k;return d}catch{return null}}
export async function wipe(){await forgetDevice();localStorage.removeItem('igp.data');localStorage.removeItem('igp.salt');localStorage.removeItem('igp.rem');key=null}
