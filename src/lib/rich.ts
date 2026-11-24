/** Форматированный текст (1.52): куски с жирным, курсивом, подчёркиванием, зачёркиванием и ссылкой, списки, ссылки.
 *  Хранится в `El.rt` (строки из кусков), `El.lt` (вид списка), `El.ln` (ссылка всего элемента).
 *  `El.text` всегда равен простому тексту из `rt`: если они разошлись, `rt` игнорируется. */
export interface Span{t:string;b?:1;i?:1;u?:1;s?:1;h?:string}
export type Lines=Span[][];
export type LT='ul'|'ol'|'ck';
export interface RichEl{text:string;rt?:Lines;lt?:LT}

const AMP:Record<string,string>={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'};
export const escH=(s:string)=>s.replace(/[&<>"]/g,c=>AMP[c]);
const isSpan=(x:unknown):x is Span=>!!x&&typeof x==='object'&&typeof (x as Span).t==='string';
export const plainOf=(l:Lines)=>l.map(r=>r.map(s=>s.t).join('')).join('\n');
const okRt=(r:unknown):r is Lines=>Array.isArray(r)&&r.every(l=>Array.isArray(l)&&l.every(isSpan));
/** строки элемента: из `rt`, если он сходится с `text`, иначе простой текст */
export const getLines=(e:RichEl):Lines=>{if(okRt(e.rt)&&plainOf(e.rt)===e.text)return e.rt;return e.text.split('\n').map(t=>t?[{t}]:[])};
const fmtOf=(s:Span)=>!!(s.b||s.i||s.u||s.s||s.h);
export const hasFmt=(e:RichEl)=>okRt(e.rt)&&plainOf(e.rt)===e.text&&e.rt.some(l=>l.some(fmtOf));
export const isRich=(e:RichEl&{t:string})=>e.t==='text'&&(!!e.lt||hasFmt(e));
/** какие строки сохранять в `rt`: только если есть форматирование */
export const toPatch=(L:Lines):{text:string;rt?:Lines}=>({text:plainOf(L),rt:L.some(l=>l.some(fmtOf))?L:undefined});

/* ссылки: строка «вид:значение» */
export type LK='sheet'|'block'|'url'|'tel'|'mail';
export const LK_NAMES:[LK,string][]=[['sheet','Страница или попап'],['block','Блок на странице'],['url','Внешний адрес'],['tel','Телефон'],['mail','Почта']];
export const parseLink=(s?:string):{k:LK;v:string}|null=>{if(!s)return null;const i=s.indexOf(':');if(i<1)return null;const k=s.slice(0,i) as LK;if(!LK_NAMES.some(x=>x[0]===k))return null;return{k,v:s.slice(i+1)}};
export const mkLink=(k:LK,v:string)=>k+':'+v;
/** ссылка с пустым значением считается незаданной */
export const linkOk=(s?:string):boolean=>{const l=parseLink(s);return !!l&&!!l.v.trim()};
/** ссылка элемента: новая `ln` или старый переход `go` на лист */
export const linkOf=(e:{ln?:string;go?:string}):string|undefined=>e.ln!==undefined?e.ln:e.go?mkLink('sheet',e.go):undefined;
/** настоящий адрес для внешних ссылок */
export const hrefOf=(l:{k:LK;v:string}):string=>{const v=l.v.trim();return l.k==='tel'?'tel:'+v.replace(/[^\d+]/g,''):l.k==='mail'?'mailto:'+v:/^[a-z][a-z0-9+.-]*:/i.test(v)?v:'https://'+v};
/** описание ссылки для ТЗ: nm — имена листов и блоков по id */
export function linkInfo(s:string|undefined,nm:Record<string,string>):{label:string;short:string;json:Record<string,string>}|null{
const l=parseLink(s);if(!l||!l.v.trim())return null;const v=l.v.trim();
if(l.k==='sheet'||l.k==='block'){const n=nm[v];if(!n)return null;return{label:(l.k==='block'?'к блоку ':'на ')+'«'+n+'»',short:l.k==='block'?'блок':n,json:{linksTo:n}}}
if(l.k==='url')return{label:'на внешний адрес '+v,short:'сайт',json:{externalUrl:v}};
if(l.k==='tel')return{label:'звонок на '+v,short:'тел.',json:{phone:v}};
return{label:'письмо на '+v,short:'почта',json:{email:v}}}
/** все ссылки внутри текста элемента */
export const spanLinks=(e:RichEl):{text:string;h:string}[]=>{if(!hasFmt(e))return[];const o:{text:string;h:string}[]=[];for(const l of e.rt as Lines)for(const s of l)if(s.h&&linkOk(s.h))o.push({text:s.t,h:s.h});return o};
/** есть ли у элемента любая ссылка (для значка в слоях) */
export const hasAnyLink=(e:RichEl&{ln?:string;go?:string;t:string}):boolean=>linkOk(linkOf(e))||spanLinks(e).length>0;

/* HTML */
export interface HtmlOpt{tf?:(s:string)=>string;link?:(h:string)=>string}
/** текст элемента как HTML: строки, форматирование, список, ссылки (атрибуты ссылки даёт opt.link) */
export function richHtml(e:RichEl,o:HtmlOpt={}):string{const L=getLines(e);const tf=o.tf??((x:string)=>x);
const rows=L.map(l=>'<div class="rl">'+(l.length?l.map(sp=>{let h=escH(tf(sp.t));if(sp.b)h='<b>'+h+'</b>';if(sp.i)h='<i>'+h+'</i>';if(sp.u)h='<u>'+h+'</u>';if(sp.s)h='<s>'+h+'</s>';if(sp.h&&linkOk(sp.h))h='<a class="rtl"'+(o.link?o.link(sp.h):'')+'>'+h+'</a>';return h}).join(''):'<br>')+'</div>').join('');
return'<span class="rtx'+(e.lt?' '+e.lt:'')+'">'+rows+'</span>'}
/** содержимое редактора: каждая строка это div, ссылки это a с href */
export function editHtml(e:RichEl):string{const L=getLines(e);
return L.map(l=>'<div>'+(l.length?l.map(sp=>{let h=escH(sp.t);if(sp.b)h='<b>'+h+'</b>';if(sp.i)h='<i>'+h+'</i>';if(sp.u)h='<u>'+h+'</u>';if(sp.s)h='<s>'+h+'</s>';if(sp.h)h='<a href="'+escH(sp.h)+'">'+h+'</a>';return h}).join(''):'<br>')+'</div>').join('')}

/* разбор содержимого редактора обратно в строки */
type F={b?:1;i?:1;u?:1;s?:1;h?:string};
export function parseDom(root:Node):Lines{
const out:Lines=[];let cur:Span[]|null=null;
const open=():Span[]=>{if(!cur){cur=[];out.push(cur)}return cur};
const walk=(n:Node,f:F):void=>{
if(n.nodeType===3){const d=(n.nodeValue??'').replace(/[\u200b\r]/g,'').replace(/\u00a0/g,' ');if(d)open().push({t:d,...f});return}
if(n.nodeType!==1)return;const el=n as HTMLElement;const tg=el.tagName;
if(tg==='BR'){open();cur=null;return}
if(tg==='DIV'||tg==='P'||tg==='LI'){cur=null;const k=out.length;for(const c of Array.from(el.childNodes))walk(c,f);if(out.length===k)out.push([]);cur=null;return}
const g:F={...f};
if(tg==='B'||tg==='STRONG')g.b=1;else if(tg==='I'||tg==='EM')g.i=1;else if(tg==='U')g.u=1;else if(tg==='S'||tg==='STRIKE'||tg==='DEL')g.s=1;
const st=el.style;if(st){const fw=st.fontWeight;if(fw==='bold'||+fw>=600)g.b=1;if(st.fontStyle==='italic')g.i=1;const td=st.textDecorationLine||st.textDecoration||'';if(td.includes('underline'))g.u=1;if(td.includes('line-through'))g.s=1}
if(tg==='A'){const h=el.getAttribute('href');if(h&&parseLink(h))g.h=h}
for(const c of Array.from(el.childNodes))walk(c,g)};
for(const c of Array.from(root.childNodes))walk(c,{});
return out.map(norm)}
/** слияние соседних кусков с одинаковым оформлением */
const norm=(l:Span[]):Span[]=>{const r:Span[]=[];for(const s of l){if(!s.t)continue;const p=r[r.length-1];if(p&&p.b===s.b&&p.i===s.i&&p.u===s.u&&p.s===s.s&&p.h===s.h)p.t+=s.t;else r.push({...s})}return r};

/** текстовое описание оформления для ТЗ: « · жирным: «…»; ссылки в тексте: «…» → …» */
export function richNotes(e:RichEl,nm:Record<string,string>):string{
const p:string[]=[];
if(e.lt)p.push('список: '+(e.lt==='ul'?'маркированный':e.lt==='ol'?'нумерованный':'чек-лист')+', каждая строка это пункт');
if(hasFmt(e)){const g=(k:'b'|'i'|'u'|'s')=>{const a:string[]=[];for(const l of e.rt as Lines)for(const s of l)if(s[k])a.push(s.t.trim());return a.filter(Boolean)};
for(const [k,n] of [['b','жирным'],['i','курсивом'],['u','подчёркнуто'],['s','зачёркнуто']] as const){const a=g(k);if(a.length)p.push(n+': '+a.map(x=>'«'+x+'»').join(', '))}
const ls=spanLinks(e).map(x=>{const i=linkInfo(x.h,nm);return i?'«'+x.text.trim()+'» → '+i.label:''}).filter(Boolean);if(ls.length)p.push('ссылки в тексте: '+ls.join('; '))}
return p.map(x=>' · '+x).join('')}
/** то же для JSON: объект с оформлением или undefined */
export function richJson(e:RichEl,nm:Record<string,string>):Record<string,unknown>|undefined{
const o:Record<string,unknown>={};
if(e.lt)o.list=e.lt==='ul'?'bullet':e.lt==='ol'?'numbered':'checklist';
if(hasFmt(e)){for(const [k,n] of [['b','bold'],['i','italic'],['u','underline'],['s','strike']] as const){const a:string[]=[];for(const l of e.rt as Lines)for(const s of l)if(s[k]&&s.t.trim())a.push(s.t.trim());if(a.length)o[n]=a}
const ls=spanLinks(e).map(x=>{const i=linkInfo(x.h,nm);return i?{text:x.text.trim(),...i.json}:null}).filter(Boolean);if(ls.length)o.links=ls}
return Object.keys(o).length?o:undefined}

/** CSS списков и ссылок: тот же текст лежит в styles.css, в просмотре и в PDF */
export const RICH_CSS=`.rtx{display:block;max-width:100%;overflow-wrap:anywhere}.rtx .rl{min-height:1em}.rtx.ul .rl,.rtx.ol .rl,.rtx.ck .rl{padding-left:1.5em;text-indent:-1.5em}.rtx.ol{counter-reset:rn}.rtx.ol .rl{counter-increment:rn}.rtx.ul .rl::before,.rtx.ol .rl::before,.rtx.ck .rl::before{display:inline-block;width:1.5em;text-indent:0}.rtx.ul .rl::before{content:'•'}.rtx.ol .rl::before{content:counter(rn)'.'}.rtx.ck .rl::before{content:'☐'}.rtx.ck .rl.on::before{content:'☑'}.rtx.ck .rl{cursor:pointer}.rtl{text-decoration:underline;text-underline-offset:2px}`;
