import {useState,useRef,useEffect,memo} from 'react';import type React from 'react';
import {X,Plus,Monitor,Tablet,Smartphone,Star,Download,Upload,Pencil,ArrowLeft,ArrowRight,ArrowUp,ArrowDown,GripVertical,Copy,RefreshCw,Trash2,FolderPlus,ArrowUpDown,Check,ChevronDown,ChevronRight,Info,Eraser} from 'lucide-react';
import {tplsFile,parseTpls,download} from '../../lib/export';import {toast} from '../../lib/toast';import {parseTags} from '../../lib/elLib';
import './lib2.css';import {SyncChip,SyncPanel} from './SyncPanel';import {GroupPick} from './GroupPick';import {userCats,applyOrder,moveIn,catOf,NOCAT} from '../../lib/tplLib';
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
const strs=(v:unknown)=>Array.isArray(v)&&v.every(x=>typeof x==='string');
/** соседний элемент меняется местами с выбранным */
const stepList=(l:string[],id:string,dir:-1|1)=>{const i=l.indexOf(id),j=i+dir;if(i<0||j<0||j>=l.length)return l;const a=[...l];[a[i],a[j]]=[a[j],a[i]];return a};
type Dg={k:'u'|'b'|'uc'|'bc';id:string};
const S=()=>useStore.getState();
const isSet=(n:string)=>/табы|вкладк/i.test(n);
const badge=(txt:string)=><small className="pcset">{txt}</small>;

export function BlockPicker({q,tpls,cur,onPick,onTpl,first}:{first?:React.MutableRefObject<(()=>boolean)|null>;q:string;tpls:BlockTpl[];cur?:{id:string;title:string}|null;onPick:(n:string)=>void;onTpl:(id:string)=>void}){
const f=q.trim().toLowerCase();const [g,setG]=useState('Все');
const tm=useStore(x=>x.data?.tplMeta);
const [tw,setTw]=useState<number>(()=>ld('ig.lib.tw',200,v=>SZ.some(z=>z[1]===v)));
const [dv,setDv]=useState<Dev>(()=>ld<Dev>('ig.lib.dv','desktop',v=>v==='desktop'||v==='tablet'||v==='mobile'));
const [so,setSo]=useState<So>(()=>ld<So>('ig.lib.so','grp',v=>v==='grp'||v==='az'));
const [lsFav]=useState<string[]>(()=>ld<string[]>('ig.lib.fav',[],strs));
const fav=tm?.fav??lsFav;
const [recent,setRecent]=useState<string[]>(()=>ld<string[]>('ig.lib.recent',[],strs));
const [col,setCol]=useState<string[]>(()=>ld<string[]>('ig.lib.col',[],strs));
const isC=(k:string)=>!f&&col.includes(k);const tglC=(k:string)=>{const n=col.includes(k)?col.filter(x=>x!==k):[...col,k];setCol(n);sv('ig.lib.col',n)};
const [arr,setArr]=useState(false);const [sp,setSp]=useState(false);
const [ed,setEd]=useState<{id:string;name:string;cat:string;tags:string}|null>(null);
const [rc,setRc]=useState<{old:string;v:string}|null>(null);const [ng,setNg]=useState<string|null>(null);
const [pv,setPv]=useState<{x:number;y:number;els:El[];h:number;n:string}|null>(null);const pvT=useRef<ReturnType<typeof setTimeout>>();
const tf=useRef<HTMLInputElement>(null);const edRef=useRef<HTMLDivElement>(null);
const dg=useRef<Dg|null>(null);const [ov,setOv]=useState('');
const importTpls=useStore(x=>x.importTpls);
useEffect(()=>()=>clearTimeout(pvT.current),[]);
useEffect(()=>{if(ed)edRef.current?.scrollIntoView({block:'nearest',behavior:'smooth'})},[ed?.id]);
const setW=(v:number)=>{setTw(v);sv('ig.lib.tw',v)};const setD=(v:Dev)=>{setDv(v);sv('ig.lib.dv',v)};const setS=(v:So)=>{setSo(v);sv('ig.lib.so',v)};
const tgl=(k:string)=>{const n=fav.includes(k)?fav.filter(x=>x!==k):[...fav,k];sv('ig.lib.fav',n);S().setFavs(n)};
const hidePv=()=>{clearTimeout(pvT.current);setPv(null)};
const pw=dv==='desktop'?440:dv==='tablet'?300:200;
const showPv=(e:React.MouseEvent<HTMLElement>,els:El[],h:number,n:string)=>{if(arr||matchMedia('(hover:none)').matches)return;const r=e.currentTarget.getBoundingClientRect();clearTimeout(pvT.current);pvT.current=setTimeout(()=>{const ph=Math.max(20,h*pw/FW[dv])+60;const x=r.right+12+pw+24<window.innerWidth?r.right+12:Math.max(8,r.left-pw-36);setPv({x,y:Math.max(8,Math.min(r.top,window.innerHeight-ph-8)),els,h,n})},350)};
const pushR=(k:string)=>{const n=[k,...recent.filter(x=>x!==k)].slice(0,12);setRecent(n);sv('ig.lib.recent',n)};
const pickB=(n:string)=>{hidePv();pushR('b:'+n);onPick(n)};const pickU=(id:string)=>{hidePv();pushR('u:'+id);onTpl(id)};
const dlTpls=()=>{download('ig_templates.json',tplsFile(tpls),'application/json');toast('Шаблоны скачаны')};
const ulTpls=async(fl:FileList|null)=>{if(!fl)return;let n=0;const bad:string[]=[];for(const fi of Array.from(fl)){try{const l=parseTpls(await fi.text());importTpls(l);n+=l.length}catch(e){bad.push(fi.name+': '+(e instanceof Error?e.message:'ошибка'))}}if(tf.current)tf.current.value='';toast(n?`Загружено шаблонов: ${n}`+(bad.length?`. Не подошли: ${bad.length}`:''):bad.join('; ')||'Нечего загружать',undefined,5000)};
const edSet=!!(ed&&tpls.find(x=>x.id===ed.id)?.set?.length);
const saveEd=()=>{if(!ed)return;if(!ed.name.trim()){toast('Напиши название');return}S().editBlockTpl(ed.id,{name:ed.name,cat:ed.cat,tags:parseTags(ed.tags)});setEd(null);toast('Шаблон сохранён')};
const delT=(t:BlockTpl)=>{const at=tpls.findIndex(x=>x.id===t.id);S().delBlockTpl(t.id);setEd(null);toast(`Шаблон «${t.name}» удалён`,{label:'Вернуть',run:()=>S().restoreTpl(t,at)},8000)};
const tww=dv==='desktop'?tw:dv==='tablet'?Math.round(tw*.7):Math.round(tw*.45);
const kb=(t:Tpl)=>'b:'+t.name,ku=(t:BlockTpl)=>'u:'+t.id;
const hit=(n:string,x:string[]=[])=>n.toLowerCase().includes(f)||x.some(v=>v.toLowerCase().includes(f));
const srt=arr?'grp':so;
const ord=<T,>(a:T[],nm:(t:T)=>string)=>srt==='az'?[...a].sort((x,y)=>nm(x).localeCompare(nm(y),'ru')):a;
const tg=g.startsWith('t:')?g.slice(2):'';const myTags=[...new Set(tpls.flatMap(t=>t.tags??[]))].sort();
/* порядок: свои группы и макеты, готовые группы и макеты */
const uc=userCats({blockTpls:tpls,tplMeta:tm});
const bc=applyOrder([...CATS],tm?.catOrd);
const bNames=(c:string)=>applyOrder(TPLS.filter(t=>t.cat===c).map(t=>t.name),tm?.itemOrd?.[c]);
const mine=uc.map(c=>[c,ord(tpls.filter(t=>catOf(t)===c&&hit(t.name,[c,...(t.tags??[])])&&(!tg||!!t.tags?.includes(tg))),t=>t.name)] as const).filter(([c,i])=>(i.length&&(g==='Все'||g==='m:'+c||!!tg))||(!f&&!tg&&(g==='m:'+c||(arr&&g==='Все'))));
const lib=bc.map(c=>[c,ord(bNames(c).map(n=>TPLS.find(t=>t.name===n)!).filter(t=>t&&hit(t.name,[c])),t=>t.name)] as const).filter(([c,i])=>i.length&&(g==='Все'||g===c));
const favB=TPLS.filter(t=>fav.includes(kb(t))),favU=tpls.filter(t=>fav.includes(ku(t)));
const favItems=ord([...favB.filter(t=>hit(t.name,[t.cat])).map(t=>({n:t.name,t:t as Tpl|BlockTpl})),...favU.filter(t=>hit(t.name,[catOf(t),...(t.tags??[])])).map(t=>({n:t.name,t:t as Tpl|BlockTpl}))],x=>x.n);
const recItems=recent.map(k=>k.startsWith('b:')?TPLS.find(t=>'b:'+t.name===k):tpls.find(t=>'u:'+t.id===k)).filter((t):t is Tpl|BlockTpl=>!!t).filter(t=>hit(t.name,[('cat' in t&&t.cat)||'']));
/* перетаскивание: источник и приёмник */
const dnd=(k:Dg['k'],id:string,ok:(x:Dg)=>boolean,drop:(x:Dg)=>void,drag=true)=>{const key=k+':'+id;return arr?{...(drag?{draggable:true,onDragStart:(e:React.DragEvent)=>{dg.current={k,id};e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',id);e.stopPropagation()},onDragEnd:()=>{dg.current=null;setOv('')}}:{}),
onDragOver:(e:React.DragEvent)=>{const x=dg.current;if(!x||!ok(x))return;e.preventDefault();e.stopPropagation();setOv(key)},
onDragLeave:()=>setOv(o=>o===key?'':o),
onDrop:(e:React.DragEvent)=>{const x=dg.current;if(!x||!ok(x))return;e.preventDefault();e.stopPropagation();dg.current=null;setOv('');drop(x)}}:{}};
const ovc=(k:string)=>ov===k?' over':'';
const grip=<span className="pcgrip" aria-hidden="true"><GripVertical size={14}/></span>;
const star=(k:string)=>{const on=fav.includes(k);return<button type="button" className={'pcs'+(on?' on':'')} aria-pressed={on} title={on?'Убрать из избранного':'В избранное'} onClick={()=>tgl(k)}><Star size={12} fill={on?'currentColor':'none'}/></button>};
const mv=(l:()=>void,r:()=>void)=><div className="pcmv"><button type="button" aria-label="Сдвинуть влево" title="Сдвинуть влево" onClick={l}><ArrowLeft size={14}/></button>{grip}<button type="button" aria-label="Сдвинуть вправо" title="Сдвинуть вправо" onClick={r}><ArrowRight size={14}/></button></div>;
const cardU=(t:BlockTpl,pre:string)=>{const c=catOf(t);return<div key={pre+t.id} className={'pcw'+(arr?' arr':'')+ovc('u:'+t.id)} onMouseEnter={e=>showPv(e,t.els[dv],t.h[dv],t.name)} onMouseLeave={hidePv} {...dnd('u',t.id,x=>x.k==='u'&&x.id!==t.id,x=>S().moveTpl(x.id,{cat:c,before:t.id}))}>
<button type="button" className="pc" data-k="u" data-id={t.id} onClick={()=>arr?setEd({id:t.id,name:t.name,cat:t.cat??'',tags:(t.tags??[]).join(', ')}):pickU(t.id)}><Thumb els={t.els[dv]} h={t.h[dv]} dev={dv} tw={tww}/><span>{t.name}</span>{t.set?.length?badge('Набор из '+t.set.length+' блоков'):null}{t.tags?.length?<small className="pctg">{t.tags.map(x=>'#'+x).join(' ')}</small>:null}</button>
{star(ku(t))}
<button type="button" className="pcx pce" title="Изменить: название, группа, теги, обновить, удалить" aria-label="Изменить шаблон" onClick={()=>setEd({id:t.id,name:t.name,cat:t.cat??'',tags:(t.tags??[]).join(', ')})}><Pencil size={12}/></button>
<button type="button" className="pcx" title="Удалить шаблон" aria-label="Удалить шаблон" onClick={()=>delT(t)}><X size={12}/></button>
{arr&&mv(()=>S().stepTpl(t.id,-1),()=>S().stepTpl(t.id,1))}</div>};
const cardB=(t:Tpl,pre:string,inGroup=false)=>{const b=built(t.name);const l=bNames(t.cat);return<div key={pre+t.name} className={'pcw'+(arr&&inGroup?' arr':'')+ovc('b:'+t.name)} onMouseEnter={e=>showPv(e,b.els[dv].filter(x=>!x.hid),b.h[dv],t.name)} onMouseLeave={hidePv} {...(inGroup?dnd('b',t.name,x=>x.k==='b'&&x.id!==t.name&&TPLS.find(y=>y.name===x.id)?.cat===t.cat,x=>S().setLibOrder({itemOrd:{[t.cat]:moveIn(l,x.id,t.name)}})):{})}>
<button type="button" className="pc" data-k="b" data-id={t.name} onClick={()=>pickB(t.name)}><Thumb els={b.els[dv].filter(e=>!e.hid)} h={b.h[dv]} dev={dv} tw={tww}/><span>{t.name}</span>{isSet(t.name)?badge('Вкладки — отдельные блоки'):null}</button>{star(kb(t))}
{arr&&inGroup&&mv(()=>S().setLibOrder({itemOrd:{[t.cat]:stepList(l,t.name,-1)}}),()=>S().setLibOrder({itemOrd:{[t.cat]:stepList(l,t.name,1)}}))}</div>};
const nav=(id:string,label:string,n:number,extra?:object)=><button type="button" key={id} className={(g===id?'on':'')+(extra&&ov===(extra as {key?:string}).key?' over':'')} onClick={()=>setG(id)} {...(extra&&'p' in extra?(extra as {p:object}).p:{})}><span>{label}</span><small>{n}</small></button>;
const firstHit=mine[0]?.[1][0]?{u:mine[0][1][0]}:lib[0]?.[1][0]?{b:lib[0][1][0]}:null;
const nFound=mine.reduce((a,[,i])=>a+i.length,0)+lib.reduce((a,[,i])=>a+i.length,0);
if(first)first.current=()=>{if(!f||!firstHit)return false;if(firstHit.u)pickU(firstHit.u.id);else if(firstHit.b)pickB(firstHit.b.name);return true};
/* клавиатура: стрелки ходят по карточкам, Alt+стрелки двигают карточку в режиме перестановки */
const onKey=(e:React.KeyboardEvent<HTMLDivElement>)=>{const k=e.key;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(k))return;const a=document.activeElement as HTMLElement|null;if(!a||!a.classList.contains('pc'))return;
if(arr&&e.altKey&&k.startsWith('Arrow')){const dir:-1|1=k==='ArrowLeft'||k==='ArrowUp'?-1:1;const id=a.dataset.id!;e.preventDefault();if(a.dataset.k==='u')S().stepTpl(id,dir);else{const c=TPLS.find(t=>t.name===id)?.cat;if(c)S().setLibOrder({itemOrd:{[c]:stepList(bNames(c),id,dir)}})}
requestAnimationFrame(()=>(e.currentTarget.querySelector(`.pc[data-id="${CSS.escape(id)}"]`) as HTMLElement|null)?.focus());return}
const all=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('.pc'));const i=all.indexOf(a);if(i<0)return;e.preventDefault();let t:HTMLElement|undefined;
if(k==='ArrowRight')t=all[i+1];else if(k==='ArrowLeft')t=all[i-1];else if(k==='Home')t=all[0];else if(k==='End')t=all[all.length-1];
else{const r=a.getBoundingClientRect();const dn=k==='ArrowDown';let best=1e9;for(const c of all){const q2=c.getBoundingClientRect();if(dn?q2.top<=r.top+8:q2.top>=r.top-8)continue;const d=Math.abs(q2.left-r.left)+Math.abs(q2.top-r.top)*.01;if(d<best){best=d;t=c}}}
if(t){t.focus();t.scrollIntoView({block:'nearest'})}};
const showFav=(g==='Все'||g==='fav')&&favItems.length>0;
const addGroup=()=>{const n=(ng??'').trim();setNg(null);if(!n)return;S().addCat(n);setG('m:'+n);setArr(true)};
const doRen=()=>{if(!rc)return;const n=rc.v.trim();if(n&&n!==rc.old){S().renameCat(rc.old,n);if(g==='m:'+rc.old)setG('m:'+n);toast('Группа переименована')}setRc(null)};
const delG=(c:string)=>{const n=tpls.filter(t=>catOf(t)===c).length;S().delCat(c);if(g==='m:'+c)setG('Все');toast(n?`Группа «${c}» удалена, шаблоны ушли в «${NOCAT}»`:`Группа «${c}» удалена`)};
const gh=(c:string,n:number,mine_:boolean)=>{const L=mine_?uc:bc;const up=()=>mine_?S().reorderCats(stepList(uc,c,-1)):S().setLibOrder({catOrd:stepList(bc,c,-1)});const dn=()=>mine_?S().reorderCats(stepList(uc,c,1)):S().setLibOrder({catOrd:stepList(bc,c,1)});
const ren=rc?.old===c;const ck=(mine_?'m:':'b:')+c;
return<div className={'lgh'+ovc((mine_?'uc:':'bc:')+c)} {...(mine_?dnd('uc',c,x=>x.k==='uc'&&x.id!==c,x=>S().reorderCats(moveIn(uc,x.id,c))):dnd('bc',c,x=>x.k==='bc'&&x.id!==c,x=>S().setLibOrder({catOrd:moveIn(bc,x.id,c)})))}>
{arr&&grip}<button type="button" className="lgc" aria-expanded={!isC(ck)} aria-label={isC(ck)?'Развернуть группу':'Свернуть группу'} title={isC(ck)?'Развернуть группу':'Свернуть группу'} onClick={()=>tglC(ck)}>{isC(ck)?<ChevronRight size={16}/>:<ChevronDown size={16}/>}</button>{ren?<input className="inp lgin" autoFocus value={rc!.v} onChange={e=>setRc({old:c,v:e.target.value})} onBlur={doRen} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();doRen()}if(e.key==='Escape')setRc(null)}}/>:<h4>{c}</h4>}<small>{n}</small>
{arr&&<div className="lgb"><button type="button" aria-label="Группу выше" title="Группу выше" disabled={L.indexOf(c)<=0} onClick={up}><ArrowUp size={14}/></button><button type="button" aria-label="Группу ниже" title="Группу ниже" disabled={L.indexOf(c)>=L.length-1} onClick={dn}><ArrowDown size={14}/></button>
{mine_&&<><button type="button" aria-label="Переименовать группу" title="Переименовать группу" onClick={()=>setRc({old:c,v:c})}><Pencil size={14}/></button>{c!==NOCAT&&<button type="button" aria-label="Удалить группу" title="Удалить группу (шаблоны останутся)" onClick={()=>delG(c)}><Trash2 size={14}/></button>}</>}</div>}</div>};
return<div className="lib"><nav className="libn">{nav('Все','Все блоки',TPLS.length+tpls.length)}{nav('fav','Избранное',favB.length+favU.length)}{recent.length>0&&nav('rec','Недавние',recItems.length)}
<h4>Мои группы</h4>
{uc.map(c=>nav('m:'+c,c,tpls.filter(t=>catOf(t)===c).length,{key:'uc:'+c,p:dnd('uc',c,x=>x.k==='uc'||x.k==='u',x=>{if(x.k==='uc')S().reorderCats(moveIn(uc,x.id,c));else S().moveTpl(x.id,{cat:c})},false)}))}
{ng===null?<button type="button" className="libadd" onClick={()=>setNg('')}><FolderPlus size={14}/>Новая группа</button>:<input className="inp lgin" autoFocus placeholder="Название группы" value={ng} onChange={e=>setNg(e.target.value)} onBlur={addGroup} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addGroup()}if(e.key==='Escape')setNg(null)}}/>}
{myTags.length>0&&<h4>Теги</h4>}{myTags.map(t=>nav('t:'+t,'#'+t,tpls.filter(x=>x.tags?.includes(t)).length))}
<h4>Библиотека</h4>{bc.map(c=>nav(c,c,TPLS.filter(t=>t.cat===c).length))}</nav>
<div className="libm" onKeyDown={onKey} style={{'--pw':(tww+20)+'px'} as React.CSSProperties}>
<div className="libset" role="group" aria-label="Настройки библиотеки"><span title="Устройство, размер и недавние хранятся на этом устройстве и не передаются на другие">Устройство</span>{DV.map(([d,n,I])=><button type="button" key={d} className={dv===d?'on':''} aria-pressed={dv===d} onClick={()=>setD(d)}><I size={14}/>{n}</button>)}<span>Размер</span>{SZ.map(([n,v])=><button type="button" key={v} className={tw===v?'on':''} aria-pressed={tw===v} onClick={()=>setW(v)}>{n}</button>)}<span>Сортировка</span>{SO.map(([k,n])=><button type="button" key={k} className={so===k?'on':''} aria-pressed={so===k} disabled={arr} onClick={()=>setS(k)}>{n}</button>)}
<span>Мои шаблоны</span><button type="button" className={arr?'on':''} aria-pressed={arr} title="Перетаскивать и менять порядок блоков и групп" onClick={()=>{setArr(!arr);setEd(null)}}><ArrowUpDown size={14}/>Порядок</button><button type="button" disabled={!tpls.length} title="Скачать мои шаблоны файлом" onClick={dlTpls}><Download size={14}/>Скачать</button><button type="button" title="Загрузить файл с шаблонами" onClick={()=>tf.current?.click()}><Upload size={14}/>Загрузить</button><button type="button" disabled={!col.length&&!arr} title="Развернуть все группы" onClick={()=>{setCol([]);sv('ig.lib.col',[])}}><ChevronDown size={14}/>Развернуть</button><button type="button" title="Свернуть все группы" onClick={()=>{const n=[...uc.map(c=>'m:'+c),...bc.map(c=>'b:'+c)];setCol(n);sv('ig.lib.col',n)}}><ChevronRight size={14}/>Свернуть</button><SyncChip open={sp} onClick={()=>setSp(!sp)}/><input ref={tf} type="file" accept=".json,application/json" multiple hidden onChange={e=>ulTpls(e.target.files)}/></div>
{sp&&<SyncPanel onClose={()=>setSp(false)}/>}
<p className="libnote"><Info size={13}/>Недавние, размер, устройство и свёрнутые группы хранятся только на этом устройстве. Шаблоны, группы, порядок и избранное синхронизируются.</p>
{arr&&<div className="pchint arrh"><b>Режим порядка.</b> Перетаскивай карточки и группы мышью или жми стрелки (на телефоне только стрелки, с клавиатуры Alt+стрелки). Карточку можно бросить на группу слева. Клик по своей карточке открывает правку.</div>}
{f&&nFound>0&&<div className="pchint">Найдено: {nFound}. Enter добавит первый: «{firstHit?.u?.name??firstHit?.b?.name}»</div>}
{ed&&<div className="pced" ref={edRef}><input className="inp" autoFocus placeholder="Название" value={ed.name} onChange={e=>setEd({...ed,name:e.target.value})} onKeyDown={e=>{if(e.key==='Enter')saveEd();if(e.key==='Escape')setEd(null)}}/><GroupPick value={ed.cat} groups={uc} onChange={v=>setEd({...ed,cat:v})}/><input className="inp" placeholder="Теги через запятую" value={ed.tags} onChange={e=>setEd({...ed,tags:e.target.value})}/>
<div className="pced-b"><button type="button" className="btn pri" onClick={saveEd}><Check size={14}/>Сохранить</button><button type="button" className="btn" disabled={!cur||edSet} title={edSet?'Набор вкладок нельзя обновить из одного блока':cur?'Заменить содержимое шаблона выбранным блоком':'Сначала выбери блок на странице'} onClick={()=>{if(!cur)return;const ok=S().refreshTpl(ed.id,cur.id);toast(ok?`Шаблон обновлён из блока «${cur.title}»`:'Набор этапов нельзя обновить одним блоком');if(ok)setEd(null)}}><RefreshCw size={14}/>Обновить из блока{cur?` «${cur.title.slice(0,18)}»`:''}</button><button type="button" className="btn" onClick={()=>{S().dupBlockTpl(ed.id);setEd(null);toast('Копия создана рядом')}}><Copy size={14}/>Дубликат</button><button type="button" className="btn dng" onClick={()=>{const t=tpls.find(x=>x.id===ed.id);if(t)delT(t)}}><Trash2 size={14}/>Удалить</button><button type="button" className="btn" onClick={()=>setEd(null)}>Отмена</button></div>{edSet&&<p className="pced-n"><Info size={14}/>Набор вкладок нельзя обновить из одного блока. Его можно только переименовать, переместить в другую группу, дублировать или удалить.</p>}</div>}
{!f&&g==='Все'&&<div className="pg"><button type="button" className="pc empty" onClick={()=>onPick('Блок')}><div className="th" style={{width:200,height:90}}><Plus size={22}/></div><span>Пустой блок</span></button></div>}
{(g==='rec'||(g==='Все'&&!f))&&recItems.length>0&&<div><h4 className="lgrec">Недавние<button type="button" className="lgclr" title="Очистить недавние на этом устройстве" onClick={()=>{setRecent([]);sv('ig.lib.recent',[]);if(g==='rec')setG('Все')}}><Eraser size={13}/>Очистить</button></h4><div className="pg">{(g==='rec'?recItems:recItems.slice(0,4)).map(t=>'cat' in t&&'spec' in t?cardB(t as Tpl,'r'):cardU(t as BlockTpl,'r'))}</div></div>}
{g==='rec'&&!recItems.length&&<h4>Пока ничего не добавляли</h4>}
{showFav&&<div><h4>Избранное</h4><div className="pg">{favItems.map(x=>'cat' in x.t&&'spec' in x.t?cardB(x.t as Tpl,'f'):cardU(x.t as BlockTpl,'f'))}</div></div>}
{g==='fav'&&!favItems.length&&<h4>{fav.length&&f?'В избранном такого нет':'Избранное пусто. Нажми на звезду у шаблона, и он появится здесь'}</h4>}
{mine.map(([c,items])=><div key={'m'+c} className={'lgs'+ovc('z:'+c)} {...dnd('u','z'+c,x=>x.k==='u',x=>S().moveTpl(x.id,{cat:c,before:null}),false)} data-zone={c}>{gh(c,items.length,true)}
{isC('m:'+c)?null:items.length?<div className="pg">{items.map(t=>cardU(t,'m'))}</div>:<div className="lgempty">Пустая группа. {arr?'Перетащи сюда шаблон или выбери группу в правке шаблона.':'Сохрани блок кнопкой «Сохранить как шаблон» и выбери эту группу.'}</div>}</div>)}
{lib.map(([c,items])=><div key={c}>{gh(c,items.length,false)}{!isC('b:'+c)&&<div className="pg">{items.map(t=>cardB(t,'b',true))}</div>}</div>)}
{g!=='fav'&&g!=='rec'&&!mine.length&&!lib.length&&<h4>Ничего не нашли. Enter создаст пустой блок с этим названием</h4>}</div>
{pv&&<div className="pcprev" style={{left:pv.x,top:pv.y,width:pw+20}}><Thumb els={pv.els} h={pv.h} dev={dv} tw={pw}/><span>{pv.n}</span></div>}</div>}
export function ContentPanel(){
const s=useStore();const sh=s.data?.projects.find(p=>p.id===s.projectId)?.sheets.find(x=>x.id===s.sheetId);
const b=sh?.blocks.find(x=>x.id===s.blockId);if(!b)return null;
return<aside className="panel"><div className="ph"><b>Контент</b><span>Блок</span><button className="btn ic" onClick={()=>s.setBlock(null)} aria-label="Закрыть"><X size={14}/></button></div><div className="sec">
<input className="inp" value={b.title} placeholder="Название блока" onChange={e=>s.editBlock(b.id,{title:e.target.value})}/>
<textarea className="inp" placeholder="Тексты блока: заголовок, подзаголовок, пункты, кнопка. Заметки для дизайнера и логика работы" value={b.text} onChange={e=>s.editBlock(b.id,{text:e.target.value})}/></div></aside>}
