const enc=new TextEncoder(),dec=new TextDecoder();
export const b64=(u:Uint8Array)=>{let s='';for(const x of u)s+=String.fromCharCode(x);return btoa(s)};
export const unb64=(s:string):Uint8Array<ArrayBuffer>=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)) as Uint8Array<ArrayBuffer>;
export async function keyFrom(pin:string,salt:BufferSource){const base=await crypto.subtle.importKey('raw',enc.encode(pin),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
export async function seal(key:CryptoKey,obj:unknown){const iv=crypto.getRandomValues(new Uint8Array(new ArrayBuffer(12)));const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(JSON.stringify(obj))));return b64(iv)+'.'+b64(ct)}
export async function unseal(key:CryptoKey,s:string){const[i,c]=s.split('.');return JSON.parse(dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(i)},key,unb64(c))))}
