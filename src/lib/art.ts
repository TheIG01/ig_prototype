// Shared drawing code: the editor, the thumbnails, the preview iframe and the exported HTML/PDF all use these functions,
// so a shape looks identical everywhere. Pure functions, no DOM.
import type {El} from '../store';
import {ICONS} from './icons';

export type Role='h1'|'h2'|'h3'|'p'|'sm';
export interface PStyle{palette:string[];head:string;body:string;roles:Record<Role,{fs:number;b:boolean}>}
export const ROLES:[Role,string][]=[['h1','Заголовок 1'],['h2','Заголовок 2'],['h3','Заголовок 3'],['p','Текст'],['sm','Мелкий текст']];
export const FONTS=['Inter','Manrope','Montserrat','Playfair Display','JetBrains Mono'];
export const defStyle=():PStyle=>({palette:['#0F172A','#2F6BFF','#64748B','#CBD5E1','#F1F5F9','#FFFFFF','#16A34A','#F59E0B'],head:'Inter',body:'Inter',
roles:{h1:{fs:56,b:true},h2:{fs:40,b:true},h3:{fs:24,b:true},p:{fs:16,b:false},sm:{fs:13,b:false}}});
const stack=(f:string)=>`'${f}',${f==='Playfair Display'?'Georgia,serif':f==='JetBrains Mono'?'ui-monospace,monospace':'system-ui,sans-serif'}`;

export const SHAPES:[string,string][]=[['rect','Квадрат'],['round','Скруглённая'],['pill','Пилюля'],['circle','Круг'],['tri','Треугольник'],['diamond','Ромб'],['poly','Многоугольник'],['star','Звезда'],['arrow','Стрелка'],['bubble','Облачко'],['tag','Плашка-указатель'],['ribbon','Лента'],['fold','Уголок'],['para','Параллелограмм'],['cross','Крест']];
export const MOCKS:[string,string][]=[['phone','Телефон'],['browser','Окно браузера'],['laptop','Ноутбук'],['tablet','Планшет']];
export const BULLETS:[string,string][]=[['dot','Точки'],['dash','Тире'],['num','Номера'],['check','Галочки']];
export const NAME_NEW:Record<string,string>={shape:'Фигура',icon:'Иконка',mock:'Мокап',list:'Список'};
/** types that are drawn as inline SVG/HTML instead of plain text */
export const ART=new Set(['shape','icon','mock','list']);

const n2=(v:number)=>Math.round(v*100)/100;
const pts=(a:[number,number][])=>a.map(p=>n2(p[0])+','+n2(p[1])).join(' ');
const ngon=(n:number,w:number,h:number,i:number,star:boolean)=>{const a:[number,number][]=[];const cx=w/2,cy=h/2,rx=w/2-i,ry=h/2-i;const m=star?n*2:n;
for(let k=0;k<m;k++){const t=-Math.PI/2+k*2*Math.PI/m;const f=star&&k%2?.45:1;a.push([cx+Math.cos(t)*rx*f,cy+Math.sin(t)*ry*f])}return a};

function shapeSvg(e:El):string{
const w=Math.max(1,e.w),h=Math.max(1,e.h),sw=e.sw??1.5,i=sw/2,fill=e.fill??'#F1F5F9',stroke=e.stroke??'#0F172A';
const at=`fill="${fill}" stroke="${sw?stroke:'none'}" stroke-width="${sw}" stroke-linejoin="round"`;const m=Math.min(w,h);let body='';const sh=e.sh??'rect';
const P=(a:[number,number][])=>`<polygon points="${pts(a)}" ${at}/>`;
if(sh==='rect'||sh==='round'||sh==='pill'){const r=sh==='pill'?m/2:Math.min(e.r??(sh==='round'?16:0),m/2);body=`<rect x="${i}" y="${i}" width="${n2(w-sw)}" height="${n2(h-sw)}" rx="${n2(r)}" ${at}/>`}
else if(sh==='circle')body=`<ellipse cx="${n2(w/2)}" cy="${n2(h/2)}" rx="${n2(w/2-i)}" ry="${n2(h/2-i)}" ${at}/>`;
else if(sh==='tri')body=P([[w/2,i],[w-i,h-i],[i,h-i]]);
else if(sh==='diamond')body=P([[w/2,i],[w-i,h/2],[w/2,h-i],[i,h/2]]);
else if(sh==='poly')body=P(ngon(Math.max(3,Math.min(12,e.n??6)),w,h,i,false));
else if(sh==='star')body=P(ngon(Math.max(3,Math.min(12,e.n??5)),w,h,i,true));
else if(sh==='arrow')body=P([[i,h*.3],[w*.6,h*.3],[w*.6,i],[w-i,h/2],[w*.6,h-i],[w*.6,h*.7],[i,h*.7]]);
else if(sh==='tag'){const t=Math.min(h/2,w/3);body=P([[i,i],[w-t,i],[w-i,h/2],[w-t,h-i],[i,h-i]])}
else if(sh==='ribbon'){const t=Math.min(h/2,w/4);body=P([[i,i],[w-i,i],[w-i-t,h/2],[w-i,h-i],[i,h-i],[t,h/2]])}
else if(sh==='fold'){const f=Math.min(m*.3,48);body=P([[i,i],[w-f,i],[w-i,f],[w-i,h-i],[i,h-i]])+`<polygon points="${pts([[w-f,i],[w-f,f],[w-i,f]])}" fill="${stroke}" fill-opacity=".14" stroke="${sw?stroke:'none'}" stroke-width="${sw}" stroke-linejoin="round"/>`}
else if(sh==='para'){const s=Math.min(h*.4,w/3);body=P([[s,i],[w-i,i],[w-s,h-i],[i,h-i]])}
else if(sh==='cross'){const t=m*.34,a=(w-t)/2,b=(h-t)/2;body=P([[a,i],[a+t,i],[a+t,b],[w-i,b],[w-i,b+t],[a+t,b+t],[a+t,h-i],[a,h-i],[a,b+t],[i,b+t],[i,b],[a,b]])}
else if(sh==='bubble'){const r=Math.min(e.r??14,w/4,h/3),hb=h*.8,x1=Math.min(w*.18,w-r*2-14),x2=x1+Math.min(22,w*.2);
body=`<path d="M${n2(r+i)} ${i}H${n2(w-r-i)}A${n2(r)} ${n2(r)} 0 0 1 ${n2(w-i)} ${n2(r+i)}V${n2(hb-r)}A${n2(r)} ${n2(r)} 0 0 1 ${n2(w-r-i)} ${n2(hb)}H${n2(x2)}L${n2(x1)} ${n2(h-i)}L${n2(x1+4)} ${n2(hb)}H${n2(r+i)}A${n2(r)} ${n2(r)} 0 0 1 ${i} ${n2(hb-r)}V${n2(r+i)}A${n2(r)} ${n2(r)} 0 0 1 ${n2(r+i)} ${i}Z" ${at}/>`}
return body}

const cross=(x:number,y:number,w:number,h:number)=>`<path d="M${n2(x)} ${n2(y)}L${n2(x+w)} ${n2(y+h)}M${n2(x+w)} ${n2(y)}L${n2(x)} ${n2(y+h)}" stroke="#CBD5E1" stroke-width="1.5" fill="none"/>`;
function mockSvg(e:El):string{
const w=Math.max(1,e.w),h=Math.max(1,e.h),sw=e.sw??2,i=sw/2,fill=e.fill??'#FFFFFF',stroke=e.stroke??'#0F172A';const at=`fill="${fill}" stroke="${stroke}" stroke-width="${sw}"`;const k=e.mk??'phone';const m=Math.min(w,h);
if(k==='phone'||k==='tablet'){const r=k==='phone'?m*.16:m*.07,b=k==='phone'?m*.06:m*.05;
return `<rect x="${i}" y="${i}" width="${n2(w-sw)}" height="${n2(h-sw)}" rx="${n2(r)}" ${at}/><rect x="${n2(b+i)}" y="${n2(b*2.2+i)}" width="${n2(w-2*b-sw)}" height="${n2(h-b*4.4-sw)}" rx="${n2(r*.4)}" fill="#F1F5F9" stroke="#CBD5E1"/>${cross(b+i,b*2.2+i,w-2*b-sw,h-b*4.4-sw)}`+(k==='phone'?`<rect x="${n2(w/2-m*.14)}" y="${n2(b*.9+i)}" width="${n2(m*.28)}" height="${n2(b*.5)}" rx="${n2(b*.25)}" fill="${stroke}"/>`:`<circle cx="${n2(w/2)}" cy="${n2(b*1.1)}" r="${n2(b*.3)}" fill="${stroke}"/>`)}
if(k==='browser'){const t=Math.min(44,h*.2);return `<rect x="${i}" y="${i}" width="${n2(w-sw)}" height="${n2(h-sw)}" rx="12" ${at}/><path d="M${i} ${t}H${n2(w-i)}" stroke="${stroke}" stroke-width="${sw}"/><circle cx="22" cy="${n2(t/2)}" r="4.5" fill="${stroke}"/><circle cx="38" cy="${n2(t/2)}" r="4.5" fill="${stroke}" fill-opacity=".45"/><circle cx="54" cy="${n2(t/2)}" r="4.5" fill="${stroke}" fill-opacity=".2"/><rect x="76" y="${n2(t/2-9)}" width="${n2(Math.max(20,w-100))}" height="18" rx="9" fill="#F1F5F9" stroke="#CBD5E1"/>${cross(i+1,t+1,w-sw-2,h-t-sw-2)}`}
const sh=h*.86;return `<rect x="${n2(w*.07)}" y="${i}" width="${n2(w*.86)}" height="${n2(sh-sw)}" rx="12" ${at}/><rect x="${n2(w*.07+10)}" y="${n2(i+10)}" width="${n2(w*.86-20)}" height="${n2(sh-sw-20)}" fill="#F1F5F9" stroke="#CBD5E1"/>${cross(w*.07+10,i+10,w*.86-20,sh-sw-20)}<path d="M${i} ${n2(sh+i)}H${n2(w-i)}L${n2(w-w*.03)} ${n2(h-i)}H${n2(w*.03)}Z" ${at} stroke-linejoin="round"/>`}

const esc=(s:string)=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'} as Record<string,string>)[c]);
const CHECK='<svg viewBox="0 0 24 24" width="1.1em" height="1.1em" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin-top:.12em"><path d="M20 6 9 17l-5-5"/></svg>';
function listHtml(e:El):string{const bu=e.bu??'dot';const lines=e.text.split('\n').filter(x=>x.trim()!=='');
return `<div style="display:flex;flex-direction:column;gap:.55em;width:100%">`+lines.map((l,k)=>`<div style="display:flex;gap:.7em;align-items:flex-start"><span style="flex:none;min-width:1.1em;opacity:.85">${bu==='num'?(k+1)+'.':bu==='dash'?'—':bu==='check'?CHECK:'•'}</span><span>${esc(l)}</span></div>`).join('')+'</div>'}

/** inner markup of shape / icon / mock / list; '' for other types */
export function artHtml(e:El):string{
if(e.t==='shape'){const lab=e.text?`<span style="position:relative;padding:8px;width:100%;pointer-events:none">${esc(e.text)}</span>`:'';
return `<svg width="${n2(e.w)}" height="${n2(e.h)}" viewBox="0 0 ${n2(e.w)} ${n2(e.h)}" style="position:absolute;left:0;top:0;display:block;overflow:visible">${shapeSvg(e)}</svg>${lab}`}
if(e.t==='icon'){const col=e.c??'#0F172A';return `<svg width="${n2(e.w)}" height="${n2(e.h)}" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="${e.sw??2}" stroke-linecap="round" stroke-linejoin="round" style="display:block">${ICONS[e.ic??'star']??ICONS.star}</svg>`}
if(e.t==='mock')return `<svg width="${n2(e.w)}" height="${n2(e.h)}" viewBox="0 0 ${n2(e.w)} ${n2(e.h)}" style="display:block;overflow:visible">${mockSvg(e)}</svg>`;
if(e.t==='list')return listHtml(e);return ''}

/** text styles of the project resolved into the element (role gives size and weight unless the element has its own) */
export const resolve=(e:El,st?:PStyle):El=>{if(!e.role||!st)return e;const r=st.roles[e.role];return r?{...e,fs:e.fs??r.fs,b:e.b??r.b}:e};

/** extra CSS declarations (kebab-case) that come from the element's own style and the project style */
export function styleMap(e0:El,st?:PStyle):Record<string,string>{
const e=resolve(e0,st);const o:Record<string,string>={};const t=e.t;
if(ART.has(t)&&t!=='list'){o['background']='none';o['border']='0';o['padding']='0';o['overflow']='visible';o['display']=t==='shape'?'flex':'block';if(t==='shape'){o['position']='absolute';if(!e.al){o['justify-content']='center';o['text-align']='center'}}}
if(t==='list'){o['align-items']='flex-start';o['overflow']='visible'}
if(e.op!==undefined&&e.op<1)o['opacity']=String(e.op);
if(e.lh!==undefined)o['line-height']=String(e.lh);
if(e.ls)o['letter-spacing']=e.ls+'px';
if(e.va&&(t==='text'||t==='rect'||t==='list'||t==='shape')){o['align-items']=e.va==='t'?'flex-start':e.va==='b'?'flex-end':'center'}
if(e.c&&t!=='icon')o['color']=e.c;
if(t==='btn'||t==='rect'||t==='input'||t==='img'){if(e.fill)o['background']=e.fill==='none'?'transparent':e.fill;if(e.stroke)o['border-color']=e.stroke==='none'?'transparent':e.stroke;if(e.sw!==undefined){o['border-width']=e.sw+'px';o['border-style']=e.sw?'solid':'none'}if(e.r!==undefined)o['border-radius']=e.r+'px'}
if(st&&(t==='text'||t==='btn'||t==='input'||t==='rect'||t==='list'||t==='shape')){const f=e.role==='h1'||e.role==='h2'||e.role==='h3'?st.head:st.body;if(f!=='Inter')o['font-family']=stack(f)}
return o}
export const styleCss=(e:El,st?:PStyle)=>Object.entries(styleMap(e,st)).map(([k,v])=>k+':'+v+';').join('');
