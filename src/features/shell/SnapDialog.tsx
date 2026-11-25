import {useEffect,useState} from 'react';
import {Camera,RotateCcw,Trash2} from 'lucide-react';
import {useStore} from '../../store';
import type {Project} from '../../store';
import {loadSnaps,addSnap,delSnap,ofProject,fmtAt} from '../../lib/snaps';
import type {Snap} from '../../lib/snaps';
import {toast} from '../../lib/toast';
const stamp=()=>new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'long'});
export function SnapDialog({pr,onClose}:{pr:Project;onClose:()=>void}){
const [all,setAll]=useState<Snap[]|null>(null);const [name,setName]=useState('');const [busy,setBusy]=useState(false);const [ask,setAsk]=useState<string|null>(null);
useEffect(()=>{void loadSnaps().then(setAll).catch(()=>setAll([]))},[]);
const list=all?ofProject(all,pr.id):[];
const fail=(e:unknown)=>toast((e as Error)?.message==='quota'?'Нет места в браузере. Удали старые снимки или скачай копию':'Снимок не сохранился: попробуй ещё раз');
const make=async()=>{setBusy(true);try{setAll(await addSnap(pr,name||'Версия от '+stamp()));setName('');toast('Версия зафиксирована')}catch(e){fail(e)}finally{setBusy(false)}};
const back=async(s:Snap)=>{setBusy(true);try{await addSnap(pr,'Перед возвратом к «'+s.name+'»').then(setAll);useStore.getState().replaceProject(s.p);setAsk(null);toast('Вернул версию «'+s.name+'». Текущее состояние сохранено как снимок');onClose()}catch(e){fail(e)}finally{setBusy(false)}};
const del=async(s:Snap)=>{try{setAll(await delSnap(s.id))}catch(e){fail(e)}};
return<div className="snd">
<p className="txt">Зафиксируй версию перед правками заказчика. Потом можно вернуться к ней одним нажатием. Снимки лежат в браузере, на этом устройстве, и закрыты тем же ПИНом. Хранится до 15 последних на проект.</p>
<div className="snd-new"><input className="inp" value={name} placeholder={'Название, например «До правок заказчика»'} maxLength={60} onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!busy)void make()}}/><button className="btn pri" disabled={busy||!all} onClick={()=>void make()}><Camera size={16}/>Зафиксировать</button></div>
<div className="snd-list">{all===null?<p className="hint">Загрузка…</p>:!list.length?<p className="hint">Снимков пока нет</p>:list.map(s=><div key={s.id} className="snd-row"><div className="snd-i"><b>{s.name}</b><span>{fmtAt(s.at)} · листов {s.sheets} · блоков {s.blocks}</span></div>
{ask===s.id?<><button className="btn pri" disabled={busy} onClick={()=>void back(s)}>Вернуть</button><button className="btn" onClick={()=>setAsk(null)}>Отмена</button></>:<><button className="btn" onClick={()=>setAsk(s.id)} title="Вернуть проект к этой версии"><RotateCcw size={16}/>Вернуть</button><button className="btn ic" onClick={()=>void del(s)} title="Удалить снимок" aria-label="Удалить снимок"><Trash2 size={16}/></button></>}</div>)}</div>
{ask&&<p className="hint">Сейчас проект станет таким, каким был в снимке. Текущее состояние я сохраню как новый снимок, так что вернуться обратно можно.</p>}
<div className="btnrow"><button className="btn" onClick={onClose}>Закрыть</button></div></div>}
