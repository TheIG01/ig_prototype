import type {El} from '../store';
const num=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
/** Новые необязательные поля `El` (1.49): убираем всё некорректное, старые проекты остаются как были. Идемпотентно. */
export function fixEl(e:El):void{
const r=e as unknown as Record<string,unknown>;
if(r.nm!==undefined&&(typeof r.nm!=='string'||!r.nm.trim()))delete r.nm;
if(r.rot!==undefined){if(!num(r.rot)||!(r.rot%360))delete r.rot;else e.rot=((r.rot%360)+360)%360}
for(const k of ['flipX','flipY','lockRatio'] as const)if(r[k]!==undefined&&r[k]!==1)delete r[k];
if(r.fc!==undefined&&r.fc!==1)delete r.fc;
if(r.cx!==undefined&&!(Array.isArray(r.cx)&&r.cx.length===4&&r.cx.every(num)))delete r.cx;
if(r.ab!==undefined){const b=r.ab as Record<string,unknown>|null;if(!b||typeof b!=='object'){delete r.ab}else{for(const k of ['a','b'])if(typeof b[k]!=='string')delete b[k];if(!b.a&&!b.b)delete r.ab}}
if(r.rc!==undefined&&!(Array.isArray(r.rc)&&r.rc.length===4&&r.rc.every(num)))delete r.rc;
if(r.dash!==undefined&&r.dash!=='solid'&&r.dash!=='dashed'&&r.dash!=='dotted')delete r.dash;
if(r.sp!==undefined&&r.sp!=='in'&&r.sp!=='out'&&r.sp!=='mid')delete r.sp;
if(r.shadow!==undefined){const s=r.shadow as Record<string,unknown>|null;if(!s||!num(s.x)||!num(s.y)||!num(s.b)||typeof s.c!=='string')delete r.shadow}
if(r.blur!==undefined&&(!num(r.blur)||r.blur<=0))delete r.blur;
/* 1.52: текст с оформлением, списки, ссылки */
if(r.lt!==undefined&&r.lt!=='ul'&&r.lt!=='ol'&&r.lt!=='ck')delete r.lt;
if(r.ln!==undefined&&typeof r.ln!=='string')delete r.ln;
if(r.cm!==undefined&&(typeof r.cm!=='string'||!r.cm.trim()))delete r.cm;
/* 1.55: настройки поля формы и компонент */
if(r.ff!==undefined){const f=r.ff as Record<string,unknown>|null;if(!f||typeof f!=='object'||typeof f.k!=='string')delete r.ff;else{for(const k of ['nm','hint','def','mask','err'])if(f[k]!==undefined&&typeof f[k]!=='string')delete f[k];if(f.req!==undefined&&f.req!==1)delete f.req;if(f.opts!==undefined&&!(Array.isArray(f.opts)&&f.opts.every(x=>typeof x==='string')))delete f.opts}}
if(r.cp!==undefined){const c=r.cp as Record<string,unknown>|null;if(!c||typeof c!=='object'||typeof c.k!=='string')delete r.cp;else{if(c.items!==undefined&&!(Array.isArray(c.items)&&c.items.every(x=>typeof x==='string')))delete c.items;if(c.v!==undefined&&!num(c.v))delete c.v;if(c.on!==undefined&&c.on!==1)delete c.on}}
if(r.rt!==undefined){const a=r.rt as unknown;const ok=Array.isArray(a)&&a.every(l=>Array.isArray(l)&&l.every(x=>!!x&&typeof x==='object'&&typeof (x as {t?:unknown}).t==='string'));if(!ok)delete r.rt}}
