import {useState,useRef,useEffect,memo} from 'react';import type React from 'react';
import {X,Plus,Monitor,Tablet,Smartphone,Star,Download,Upload,Pencil} from 'lucide-react';
import {tplsFile,parseTpls,download} from '../../lib/export';import {toast} from '../../lib/toast';import {parseTags} from '../../lib/elLib';
import './lib2.css';
import {useStore,FW} from '../../store';
import type {El,Dev,BlockTpl} from '../../store';import type {PStyle} from '../../lib/art';
import {TPLS,CATS,buildTpl} from '../../lib/tpl';import type {Tpl} from '../../lib/tpl';
import {elStyle,elInner} from '../canvas/elStyle';
/** miniature of a block: real wireframe scaled to tw px wide */
/** превью блока: memo, чтобы миниатюры не перерисовывались, пока их элементы не менялись */
export const Thumb=memo(function Thumb({els,h,dev='desktop',tw=200,st}:{els:El[];h:number;dev?:Dev;tw?:number;st?:PStyle}){
const w=FW[dev],k=tw/w;
return<div className="th" style={{width:tw,height:Math.max(20,h*k)}}><div className="th-in" style={{width:w,height:h,transform:`scale(${k})`}}>{els.map(e=><div key={e.id} className={'el '+e.t} style={elStyle(e,0,st)}>{elInner(e)}</div>)}</div></div>});
const SZ=[['Мелко',150],['Обычно',200],['Крупно',280]] as const;
const DV=[['desktop','ПК',Monitor],['tablet','Планшет',Tablet],['mobile','Телефон',Smartphone]] as const;
const ld=<T,>(k:string,d:T,ok:(v:unknown)=>boolean):T=>{try{const v=JSON.parse(localStorage.getItem(k)??'null');return ok(v)?v as T:d}catch{return d}};
const sv=(k:string,v:unknown)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{/* хранилище недоступно */}};
const cache=new Map<string,ReturnType<typeof buildTpl>>();
const built=(name:string)=>{let b=cache.get(name);if(!b){b=buildTpl(TPLS.find(t=>t.name===name)!);cache.set(name,b)}return b};
const SO=[['grp','Как в группе'],['az','А–Я']] as const;type So=typeof SO[number][0];
export function BlockPicker({q,tpls,onPick,onTpl,onDelTpl,first}:{first?:React.MutableRefObject<(()=>boolean)|null>;q:string;tpls:BlockTpl[];onPick:(n:string)=>void;onTpl:(id:string)=>void;onDelTpl:(id:string)=>void}){
const f=q.trim().toLowerCase();const [g,setG]=useState('Все');
const [tw,setTw]=useState<number>(()=>ld('ig.lib.tw',200,v=>SZ.some(z=>z[1]===v)));
const [dv,setDv]=useState<Dev>(()=>ld<Dev>('ig.lib.dv','desktop',v=>v==='desktop'||v==='tablet'||v==='mobile'));
const [so,setSo]=useState<So>(()=>ld<So>('ig.lib.so','grp',v=>v==='grp'||v==='az'));
const [fav,setFav]=useState<string[]>(()=>ld<string[]>('ig.lib.fav',[],v=>Array.isArray(v)&&v.every(x=>typeof x==='string')));
const setW=(v:number)=>{setTw(v);sv('ig.lib.tw',v)};const setD=(v:Dev)=>{setDv(v);sv('ig.lib.dv',v)};const setS=(v:So)=>{setSo(v);sv('ig.lib.so',v)};
const tgl=(k:string)=>{const n=fav.includes(k)?fav.filter(x=>x!==k):[...fav,k];setFav(n);sv('ig.lib.fav',n)};
const importTpls=useStore(x=>x.importTpls);const editTpl=useStore(x=>x.editBlockTpl);const tf=useRef<HTMLInputElement>(null);
const [recent,setRecent]=useState<string[]>(()=>ld<string[]>('ig.lib.recent',[],v=>Array.isArray(v)&&v.every(x=>typeof x==='string')));
const [ed,setEd]=useState<{id:string;name:string;cat:string;tags:string}|null>(null);
const [pv,setPv]=useState<{x:number;y:number;els:El[];h:number;n:string}|null>(null);const pvT=useRef<ReturnType<typeof setTimeout>>();
useEffect(()=>()=>clearTimeout(pvT.current),[]);
const hidePv=()=>{clearTimeout(pvT.current);setPv(null)};
const pw=dv==='desktop'?440:dv==='tablet'?300:200;
const showPv=(e:React.MouseEvent<HTMLElement>,els:El[],h:number,n:string)=>{const r=e.currentTarget.getBoundingClientRect();clearTimeout(pvT.current);pvT.current=setTimeout(()=>{const ph=Math.max(20,h*pw/FW[dv])+60;const x=r.right+12+pw+24<window.innerWidth?r.right+12:Math.max(8,r.left-pw-36);setPv({x,y:Math.max(8,Math.min(r.top,window.innerHeight-ph-8)),els,h,n})},350)};
const pushR=(k:string)=>{const n=[k,...recent.filter(x=>x!==k)].slice(0,12);setRecent(n);sv('ig.lib.recent',n)};
const pickB=(n:string)=>{hidePv();pushR('b:'+n);onPick(n)};const pickU=(id:string)=>{hidePv();pushR('u:'+id);onTpl(id)};
const dlTpls=()=>{download('ig_templates.json',tplsFile(tpls),'application/json');toast('Шаблоны скачаны')};
const ulTpls=async(fl:FileList|null)=>{if(!fl)return;let n=0;const bad:string[]=[];for(const fi of Array.from(fl)){try{const l=parseTpls(await fi.text());importTpls(l);n+=l.length}catch(e){bad.push(fi.name+': '+(e instanceof Error?e.message:'ошибка'))}}if(tf.current)tf.current.value='';toast(n?`Загружено шаблонов: ${n}`+(bad.length?`. Не подошли: ${bad.length}`:''):bad.join('; ')||'Нечего загружать',undefined,5000)};
const saveEd=()=>{if(!ed)return;if(!ed.name.trim()){toast('Напиши название');return}editTpl(ed.id,{name:ed.name,cat:ed.cat,tags:parseTags(ed.tags)});setEd(null)};
const tww=dv==='desktop'?tw:dv==='tablet'?Math.round(tw*.7):Math.round(tw*.45);
const cat=(t:BlockTpl)=>t.cat||'Мои шаблоны';
const ord=<T,>(a:T[],nm:(t:T)=>string)=>so==='az'?[...a].sort((x,y)=>nm(x).localeCompare(nm(y),'ru')):a;
const kb=(t:Tpl)=>'b:'+t.name,ku=(t:BlockTpl)=>'u:'+t.id;
const hit=(n:string,x:string[]=[])=>n.toLowerCase().includes(f)||x.some(v=>v.toLowerCase().includes(f));
const tg=g.startsWith('t:')?g.slice(2):'';const myTags=[...new Set(tpls.flatMap(t=>t.tags??[]))].sort();
const myCats=[...new Set(tpls.map(cat))];
const lib=CATS.map(c=>[c,ord(TPLS.filter(t=>t.cat===c&&hit(t.name,[c])),t=>t.name)] as const).filter(([c,i])=>i.length&&(g==='Все'||g===c));
const mine=myCats.map(c=>[c,ord(tpls.filter(t=>cat(t)===c&&hit(t.name,[c,...(t.tags??[])])&&(!tg||!!t.tags?.includes(tg))),t=>t.name)] as const).filter(([c,i])=>i.length&&(g==='Все'||g==='m:'+c||!!tg));
const favB=TPLS.filter(t=>fav.includes(kb(t))),favU=tpls.filter(t=>fav.includes(ku(t)));
const favItems=ord([...favB.filter(t=>hit(t.name,[t.cat])).map(t=>({n:t.name,k:'b'+t.name,t:t as Tpl|BlockTpl})),...favU.filter(t=>hit(t.name,[cat(t),...(t.tags??[])])).map(t=>({n:t.name,k:'u'+t.id,t:t as Tpl|BlockTpl}))],x=>x.n);
const star=(k:string)=>{const on=fav.includes(k);return<button type="button" className={'pcs'+(on?' on':'')} aria-pressed={on} title={on?'Убрать из избранного':'В избранное'} onClick={()=>tgl(k)}><Star size={12} fill={on?'currentColor':'none'}/></button>};
const recItems=recent.map(k=>k.startsWith('b:')?TPLS.find(t=>'b:'+t.name===k):tpls.find(t=>'u:'+t.id===k)).filter((t):t is Tpl|BlockTpl=>!!t).filter(t=>hit(t.name,[('cat' in t&&t.cat)||'']));
const cardU=(t:BlockTpl,pre:string)=><div key={pre+t.id} className="pcw" onMouseEnter={e=>showPv(e,t.els[dv],t.h[dv],t.name)} onMouseLeave={hidePv}><button type="button" className="pc" onClick={()=>pickU(t.id)}><Thumb els={t.els[dv]} h={t.h[dv]} dev={dv} tw={tww}/><span>{t.name}</span>{t.set?.length?badge('Набор из '+t.set.length+' блоков'):null}{t.tags?.length?<small className="pctg">{t.tags.map(x=>'#'+x).join(' ')}</small>:null}</button>{star(ku(t))}<button type="button" className="pcx pce" title="Название, группа, теги" aria-label="Изменить шаблон" onClick={()=>setEd({id:t.id,name:t.name,cat:t.cat??'',tags:(t.tags??[]).join(', ')})}><Pencil size={12}/></button><button type="button" className="pcx" title="Удалить шаблон" onClick={()=>onDelTpl(t.id)}><X size={12}/></button></div>;
const cardB=(t:Tpl,pre:string)=>{const b=built(t.name);return<div key={pre+t.name} className="pcw" onMouseEnter={e=>showPv(e,b.els[dv].filter(x=>!x.hid),b.h[dv],t.name)} onMouseLeave={hidePv}><button type="button" className="pc" onClick={()=>pickB(t.name)}><Thumb els={b.els[dv].filter(e=>!e.hid)} h={b.h[dv]} dev={dv} tw={tww}/><span>{t.name}</span>{isSet(t.name)?badge('Вкладки — отдельные блоки'):null}</button>{star(kb(t))}</div>};
const nav=(id:string,label:string,n:number)=><button type="button" key={id} className={g===id?'on':''} onClick={()=>setG(id)}><span>{label}</span><small>{n}</small></button>;
const firstHit=mine[0]?.[1][0]?{u:mine[0][1][0]}:lib[0]?.[1][0]?{b:lib[0][1][0]}:null;
const nFound=mine.reduce((a,[,i])=>a+i.length,0)+lib.reduce((a,[,i])=>a+i.length,0);
if(first)first.current=()=>{if(!f||!firstHit)return false;if(firstHit.u)pickU(firstHit.u.id);else if(firstHit.b)pickB(firstHit.b.name);return true};
const isSet=(n:string)=>/табы|вкладк/i.test(n);
const badge=(txt:string)=><small className="pcset">{txt}</small>;
const onKey=(e:React.KeyboardEvent<HTMLDivElement>)=>{const k=e.key;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(k))return;const a=document.activeElement as HTMLElement|null;if(!a||!a.classList.contains('pc'))return;const all=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('.pc'));const i=all.indexOf(a);if(i<0)return;e.preventDefault();let t:HTMLElement|undefined;
if(k==='ArrowRight')t=all[i+1];else if(k==='ArrowLeft')t=all[i-1];else if(k==='Home')t=all[0];else if(k==='End')t=all[all.length-1];
else{const r=a.getBoundingClientRect();const dn=k==='ArrowDown';let best=1e9;for(const c of all){const q2=c.getBoundingClientRect();if(dn?q2.top<=r.top+8:q2.top>=r.top-8)continue;const d=Math.abs(q2.left-r.left)+Math.abs(q2.top-r.top)*.01;if(d<best){best=d;t=c}}}
if(t){t.focus();t.scrollIntoView({block:'nearest'})}};
const showFav=(g==='Все'||g==='fav')&&favItems.length>0;
return<div className="lib"><nav className="libn">{nav('Все','Все блоки',TPLS.length+tpls.length)}{nav('fav','Избранное',favB.length+favU.length)}{recent.length>0&&nav('rec','Недавние',recItems.length)}
{myCats.length>0&&<h4>Мои группы</h4>}{myCats.map(c=>nav('m:'+c,c,tpls.filter(t=>cat(t)===c).length))}{myTags.length>0&&<h4>Теги</h4>}{myTags.map(t=>nav('t:'+t,'#'+t,tpls.filter(x=>x.tags?.includes(t)).length))}
<h4>Библиотека</h4>{CATS.map(c=>nav(c,c,TPLS.filter(t=>t.cat===c).length))}</nav>
<div className="libm" onKeyDown={onKey} style={{'--pw':(tww+20)+'px'} as React.CSSProperties}>
<div className="libset" role="group" aria-label="Настройки библиотеки"><span>Устройство</span>{DV.map(([d,n,I])=><button type="button" key={d} className={dv===d?'on':''} aria-pressed={dv===d} onClick={()=>setD(d)}><I size={14}/>{n}</button>)}<span>Размер</span>{SZ.map(([n,v])=><button type="button" key={v} className={tw===v?'on':''} aria-pressed={tw===v} onClick={()=>setW(v)}>{n}</button>)}<span>Порядок</span>{SO.map(([k,n])=><button type="button" key={k} className={so===k?'on':''} aria-pressed={so===k} onClick={()=>setS(k)}>{n}</button>)}<span>Мои шаблоны</span><button type="button" disabled={!tpls.length} title="Скачать мои шаблоны файлом" onClick={dlTpls}><Download size={14}/>Скачать</button><button type="button" title="Загрузить файл с шаблонами" onClick={()=>tf.current?.click()}><Upload size={14}/>Загрузить</button><input ref={tf} type="file" accept=".json,application/json" multiple hidden onChange={e=>ulTpls(e.target.files)}/></div>
{f&&nFound>0&&<div className="pchint">Найдено: {nFound}. Enter добавит первый: «{firstHit?.u?.name??firstHit?.b?.name}»</div>}
{ed&&<div className="pced"><input className="inp" autoFocus placeholder="Название" value={ed.name} onChange={e=>setEd({...ed,name:e.target.value})} onKeyDown={e=>{if(e.key==='Enter')saveEd();if(e.key==='Escape')setEd(null)}}/><input className="inp" list="pced-g" placeholder="Группа" value={ed.cat} onChange={e=>setEd({...ed,cat:e.target.value})}/><datalist id="pced-g">{myCats.map(c=><option key={c} value={c}/>)}</datalist><input className="inp" placeholder="Теги через запятую" value={ed.tags} onChange={e=>setEd({...ed,tags:e.target.value})}/><button type="button" className="btn pri" onClick={saveEd}>Сохранить</button><button type="button" className="btn" onClick={()=>setEd(null)}>Отмена</button></div>}
{!f&&g==='Все'&&<div className="pg"><button type="button" className="pc empty" onClick={()=>onPick('Блок')}><div className="th" style={{width:200,height:90}}><Plus size={22}/></div><span>Пустой блок</span></button></div>}
{(g==='rec'||(g==='Все'&&!f))&&recItems.length>0&&<div><h4>Недавние</h4><div className="pg">{(g==='rec'?recItems:recItems.slice(0,4)).map(t=>'cat' in t&&'spec' in t?cardB(t as Tpl,'r'):cardU(t as BlockTpl,'r'))}</div></div>}
{g==='rec'&&!recItems.length&&<h4>Пока ничего не добавляли</h4>}
{showFav&&<div><h4>Избранное</h4><div className="pg">{favItems.map(x=>'cat' in x.t&&'spec' in x.t?cardB(x.t as Tpl,'f'):cardU(x.t as BlockTpl,'f'))}</div></div>}
{g==='fav'&&!favItems.length&&<h4>{fav.length&&f?'В избранном такого нет':'Избранное пусто. Нажми на звезду у шаблона, и он появится здесь'}</h4>}
{mine.map(([c,items])=><div key={'m'+c}><h4>{c}</h4><div className="pg">{items.map(t=>cardU(t,'m'))}</div></div>)}
{lib.map(([c,items])=><div key={c}><h4>{c}</h4><div className="pg">{items.map(t=>cardB(t,'b'))}</div></div>)}
{g!=='fav'&&g!=='rec'&&!mine.length&&!lib.length&&<h4>Ничего не нашли. Enter создаст пустой блок с этим названием</h4>}</div>
{pv&&<div className="pcprev" style={{left:pv.x,top:pv.y,width:pw+20}}><Thumb els={pv.els} h={pv.h} dev={dv} tw={pw}/><span>{pv.n}</span></div>}</div>}
export function ContentPanel(){
const s=useStore();const sh=s.data?.projects.find(p=>p.id===s.projectId)?.sheets.find(x=>x.id===s.sheetId);
const b=sh?.blocks.find(x=>x.id===s.blockId);if(!b)return null;
return<aside className="panel"><div className="ph"><b>Контент</b><span>Блок</span><button className="btn ic" onClick={()=>s.setBlock(null)} aria-label="Закрыть"><X size={14}/></button></div><div className="sec">
<input className="inp" value={b.title} placeholder="Название блока" onChange={e=>s.editBlock(b.id,{title:e.target.value})}/>
<textarea className="inp" placeholder="Тексты блока: заголовок, подзаголовок, пункты, кнопка. Заметки для дизайнера и логика работы" value={b.text} onChange={e=>s.editBlock(b.id,{text:e.target.value})}/></div></aside>}
