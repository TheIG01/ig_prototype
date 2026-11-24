import type {El} from '../store';
const num=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
/** Новые необязательные поля `El` (1.49): убираем всё некорректное, старые проекты остаются как были. Идемпотентно. */
export function fixEl(e:El):void{
const r=e as unknown as Record<string,unknown>;
if(r.nm!==undefined&&(typeof r.nm!=='string'||!r.nm.trim()))delete r.nm;
if(r.rot!==undefined){if(!num(r.rot)||!(r.rot%360))delete r.rot;else e.rot=((r.rot%360)+360)%360}
for(const k of ['flipX','flipY','lockRatio'] as const)if(r[k]!==undefined&&r[k]!==1)delete r[k];
if(r.rc!==undefined&&!(Array.isArray(r.rc)&&r.rc.length===4&&r.rc.every(num)))delete r.rc;
if(r.dash!==undefined&&r.dash!=='solid'&&r.dash!=='dashed'&&r.dash!=='dotted')delete r.dash;
if(r.sp!==undefined&&r.sp!=='in'&&r.sp!=='out'&&r.sp!=='mid')delete r.sp;
if(r.shadow!==undefined){const s=r.shadow as Record<string,unknown>|null;if(!s||!num(s.x)||!num(s.y)||!num(s.b)||typeof s.c!=='string')delete r.shadow}
if(r.blur!==undefined&&(!num(r.blur)||r.blur<=0))delete r.blur;
/* 1.52: текст с оформлением, списки, ссылки */
if(r.lt!==undefined&&r.lt!=='ul'&&r.lt!=='ol'&&r.lt!=='ck')delete r.lt;
if(r.ln!==undefined&&typeof r.ln!=='string')delete r.ln;
if(r.cm!==undefined&&(typeof r.cm!=='string'||!r.cm.trim()))delete r.cm;
if(r.rt!==undefined){const a=r.rt as unknown;const ok=Array.isArray(a)&&a.every(l=>Array.isArray(l)&&l.every(x=>!!x&&typeof x==='object'&&typeof (x as {t?:unknown}).t==='string'));if(!ok)delete r.rt}}
