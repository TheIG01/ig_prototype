/** автобэкап: раз в неделю напоминание, запись в выбранную папку (где браузер умеет) */
export const WEEK=7*864e5;
const K='igp.bak';
interface St{last:number;snooze:number;off:boolean;dir:string}
const def=():St=>({last:0,snooze:0,off:false,dir:''});
export const bakGet=():St=>{try{return{...def(),...JSON.parse(localStorage.getItem(K)||'{}')}}catch{return def()}};
export const bakSet=(p:Partial<St>)=>{try{localStorage.setItem(K,JSON.stringify({...bakGet(),...p}))}catch{/* нет места: не страшно */}};
/** копия сделана: отсчёт недели с этой минуты */
export const bakDone=()=>bakSet({last:Date.now(),snooze:0});
/** пора ли показать плашку; первый запуск считает неделю от первого открытия */
export function bakDue(now=Date.now()){const s=bakGet();if(s.off)return false;if(!s.last){bakSet({last:now});return false}return now-s.last>=WEEK&&now>=s.snooze}
export const bakLater=()=>bakSet({snooze:Date.now()+864e5});
export const canDir=()=>typeof window!=='undefined'&&'showDirectoryPicker' in window;
const idb=()=>new Promise<IDBDatabase>((res,rej)=>{const r=indexedDB.open('igp-bak',1);r.onupgradeneeded=()=>r.result.createObjectStore('k');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
async function kv<T>(m:IDBTransactionMode,f:(s:IDBObjectStore)=>IDBRequest):Promise<T>{const db=await idb();return new Promise((res,rej)=>{const r=f(db.transaction('k',m).objectStore('k'));r.onsuccess=()=>res(r.result as T);r.onerror=()=>rej(r.error)})}
type Dir={name:string;requestPermission:(o:{mode:string})=>Promise<string>;getFileHandle:(n:string,o:{create:boolean})=>Promise<{createWritable:()=>Promise<{write:(t:string)=>Promise<void>;close:()=>Promise<void>}>}>};
const getDir=()=>kv<Dir|undefined>('readonly',s=>s.get('dir')).catch(()=>undefined);
/** выбрать папку для копий; вернёт её название или '' при отмене */
export async function pickDir():Promise<string>{try{const d=await(window as unknown as {showDirectoryPicker:(o:{mode:string})=>Promise<Dir>}).showDirectoryPicker({mode:'readwrite'});await kv('readwrite',s=>s.put(d,'dir'));bakSet({dir:d.name});return d.name}catch{return ''}}
export async function forgetDir(){await kv('readwrite',s=>s.delete('dir')).catch(()=>{});bakSet({dir:''})}
const stamp=()=>new Date().toISOString().slice(0,10);
/** записать копию в папку; true, если записалось. Вызывать из нажатия кнопки */
export async function writeDir(text:string):Promise<boolean>{const d=await getDir();if(!d)return false;try{if(await d.requestPermission({mode:'readwrite'})!=='granted')return false;const f=await d.getFileHandle('ig_prototype_'+stamp()+'.json',{create:true});const w=await f.createWritable();await w.write(text);await w.close();bakDone();return true}catch{return false}}
