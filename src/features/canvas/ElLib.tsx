import {useEffect,useMemo,useRef,useState} from 'react';
import {useStore} from '../../store';
import {Search,Download,Upload,RefreshCw,Link2,Pencil,X,Plus} from 'lucide-react';
import type {El} from '../../store';
import type {PStyle} from '../../lib/art';
import {elStyle,elInner} from './elStyle';
import {builtinItems,BUILTIN_CATS} from '../../lib/elLibBuiltin';
import {useLib,addItem,updateItem,editItem,removeItem,restoreItem,libFile,importFile,getRecent,pushRecent,parseTags,instantiate} from '../../lib/elLib';
import type {LibItem} from '../../lib/elLib';
import {download} from '../../lib/export';
import {toast} from '../../lib/toast';
import './elib.css';

const Mini=({it,st}:{it:LibItem;st?:PStyle})=>{const k=Math.min(1,104/it.w,56/Math.max(it.h,1));
return<div className="th elib-pv" style={{width:Math.max(12,Math.round(it.w*k)),height:Math.max(8,Math.round(it.h*k))}}><div className="th-in" style={{width:it.w,height:Math.max(it.h,1),transform:`scale(${k})`}}>{it.els.filter(e=>!e.hid).map(e=><div key={e.id} className={'el '+e.t} style={elStyle(e,0,st)}>{elInner(e)}</div>)}</div></div>};

let handled=0;
type Form={mode:'new'|'edit';id?:string;name:string;cat:string;tags:string};

/** панель «Библиотека»: готовые и свои наборы элементов. sel: выделенные элементы (с группами) для сохранения и обновления */
export default function ElLib({st,sel,saveReq,onPut}:{st?:PStyle;sel:El[];saveReq:number;onPut:(es:El[],w:number,name:string)=>void}){
const own=useLib();const base=useMemo(builtinItems,[]);
const [q,setQ]=useState('');const [cat,setCat]=useState('Все');const [rec,setRec]=useState<string[]>(getRecent);
const [form,setForm]=useState<Form|null>(null);const file=useRef<HTMLInputElement>(null);
useEffect(()=>{if(saveReq<=handled)return;handled=saveReq;if(sel.length)setForm({mode:'new',name:'',cat:'Мои',tags:''});else toast('Выдели элементы на холсте, чтобы сохранить их в библиотеку')},[saveReq]);// eslint-disable-line react-hooks/exhaustive-deps
const all=useMemo(()=>[...base,...own],[base,own]);
const ownCats=[...new Set(own.map(x=>x.cat))].filter(c=>!(BUILTIN_CATS as readonly string[]).includes(c));
const isOwn=(it:LibItem)=>own.some(x=>x.id===it.id);
const f=q.trim().toLowerCase();
const list=all.filter(it=>(cat==='Все'||(cat==='Недавние'?rec.includes(it.id):it.cat===cat))&&(!f||it.name.toLowerCase().includes(f)||it.cat.toLowerCase().includes(f)||it.tags.some(t=>t.includes(f))));
const shown=cat==='Недавние'?rec.map(id=>list.find(x=>x.id===id)).filter((x):x is LibItem=>!!x):list;
const put=(it:LibItem)=>{onPut(instantiate({...it,id:isOwn(it)?it.id:undefined}),it.w,it.name);setRec(pushRecent(it.id))};
const submit=()=>{if(!form)return;const name=form.name.trim();if(!name){toast('Напиши название');return}
if(form.mode==='new'){const r=addItem({name,cat:form.cat.trim()||'Мои',tags:parseTags(form.tags),els:sel});if(!r.item){toast('Не получилось сохранить выделение');return}toast(r.saved?`«${name}» в библиотеке элементов`:'Набор добавлен, но браузер не дал сохранить его на устройстве. Скачай файл, чтобы не потерять',undefined,5000);setCat(r.item.cat)}
else if(form.id){if(!editItem(form.id,{name,cat:form.cat,tags:parseTags(form.tags)}))toast('Браузер не дал сохранить изменения')}
setForm(null)};
const upd=(it:LibItem)=>{if(!sel.length){toast('Выдели элементы, чем заменить набор');return}const r=updateItem(it.id,sel);toast(r===null?'Не получилось обновить':r?`«${it.name}» обновлён из выделения`:'Браузер не дал сохранить изменения')};
const [keepT,setKeepT]=useState(true);const sync=(it:LibItem)=>{const r=useStore.getState().syncLib(it.id,it.els,it.name,keepT);if(!r.copies){toast(`Копий «${it.name}» в проекте нет. Копии, вставленные раньше, не связаны`);return}toast(`Обновлено копий «${it.name}»: ${r.copies}`,{label:'Отменить',run:()=>useStore.getState().undo()},6000)};
const del=(it:LibItem)=>{const gone=removeItem(it.id);if(gone)toast(`«${it.name}» удалён`,{label:'Вернуть',run:()=>restoreItem(gone)},6000)};
const up=async(fl:FileList|null)=>{if(!fl)return;let n=0;const bad:string[]=[];for(const fi of Array.from(fl)){try{n+=importFile(await fi.text())}catch(e){bad.push(fi.name+': '+(e instanceof Error?e.message:'ошибка'))}}if(file.current)file.current.value='';toast(n?`Загружено наборов: ${n}`+(bad.length?`. Не подошли: ${bad.length}`:''):bad.join('; ')||'Нечего загружать',undefined,5000)};
const cats=['Все',...(rec.length?['Недавние']:[]),...BUILTIN_CATS,...ownCats];
return<div className="elib">
<div className="elib-t"><label className="search"><Search size={14}/><input placeholder="Найти: форма, телефон, скидка" value={q} onChange={e=>setQ(e.target.value)}/></label>
<button className="btn" disabled={!sel.length} title="Сохранить выделенное (Ctrl+Alt+K)" onClick={()=>setForm({mode:'new',name:'',cat:'Мои',tags:''})}><Plus size={14}/>Сохранить</button></div>
<div className="chips elib-c">{cats.map(c=><button key={c} className={cat===c?'on':''} onClick={()=>setCat(c)}>{c}</button>)}</div>
{form&&<div className="elib-f"><b>{form.mode==='new'?`Новый набор: ${sel.length} шт.`:'Параметры набора'}</b>
<input className="inp" autoFocus placeholder="Название, например: Форма заявки" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} onKeyDown={e=>{if(e.key==='Enter')submit();if(e.key==='Escape')setForm(null)}}/>
<input className="inp" list="elib-cats" placeholder="Категория" value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})}/><datalist id="elib-cats">{[...BUILTIN_CATS,...ownCats,'Мои'].map(c=><option key={c} value={c}/>)}</datalist>
<input className="inp" placeholder="Теги через запятую: заявка, телефон" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})}/>
<div className="btnrow"><button className="btn pri" onClick={submit}>Сохранить</button><button className="btn" onClick={()=>setForm(null)}>Отмена</button></div></div>}
<div className="ins-g c3 sc elib-g">{shown.map(it=>{const mine=isOwn(it);return<div key={it.id} className="elib-w"><button className="cell tall" title={it.tags.length?it.tags.join(', '):it.name} onClick={()=>put(it)}><Mini it={it} st={st}/><small>{it.name}</small></button>
{mine&&<span className="elib-a"><button title="Обновить все копии в проекте по этому набору" aria-label="Обновить все копии" onClick={()=>sync(it)}><Link2 size={11}/></button><button title="Обновить из выделения" aria-label="Обновить из выделения" onClick={()=>upd(it)}><RefreshCw size={11}/></button><button title="Название, категория, теги" aria-label="Изменить параметры" onClick={()=>setForm({mode:'edit',id:it.id,name:it.name,cat:it.cat,tags:it.tags.join(', ')})}><Pencil size={11}/></button><button title="Удалить из библиотеки" aria-label="Удалить" onClick={()=>del(it)}><X size={11}/></button></span>}</div>})}
{!shown.length&&<p className="mut elib-e">{cat==='Недавние'?'Пока ничего не вставляли':f?'Ничего не нашлось':'Здесь пусто. Выдели элементы и нажми Ctrl+Alt+K'}</p>}</div>
<div className="elib-b"><label className="elib-k"><input type="checkbox" checked={keepT} onChange={e=>setKeepT(e.target.checked)}/>Тексты копий не менять</label><span>Ctrl+Alt+K сохранить выделенное · Ctrl+Alt+B отсоединить от библиотеки</span><span className="elib-io"><button className="btn ic" disabled={!own.length} title="Скачать мои наборы" aria-label="Скачать мои наборы" onClick={()=>{download('ig_elements.json',libFile(own),'application/json');toast('Файл с наборами скачан')}}><Download size={14}/></button><button className="btn ic" title="Загрузить файл с наборами" aria-label="Загрузить файл с наборами" onClick={()=>file.current?.click()}><Upload size={14}/></button></span><input ref={file} type="file" accept=".json,application/json" multiple hidden onChange={e=>up(e.target.files)}/></div></div>}
