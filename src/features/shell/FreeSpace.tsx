import {useMemo,useState} from 'react';
import {Trash2,Download} from 'lucide-react';
import {useStore} from '../../store';
import {isOwner} from '../../lib/tabs';import {toast} from '../../lib/toast';
const kb=(n:number)=>n>=1048576?(n/1048576).toFixed(1).replace('.',',')+' МБ':Math.max(1,Math.round(n/1024))+' КБ';
const used=()=>{try{let n=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k)n+=(k.length+(localStorage.getItem(k)?.length??0))*2}return n}catch{return 0}};
/** «Освободить место»: автор отмечает проекты, которые можно удалить; последний проект удалить нельзя */
export function FreeSpace({onBackup}:{onBackup:()=>void}){
const projects=useStore(x=>x.data?.projects);const del=useStore(x=>x.delProject);
const [pick,setPick]=useState<string[]>([]);const [ask,setAsk]=useState(false);const [tick,setTick]=useState(0);
const rows=useMemo(()=>(projects??[]).map(p=>({id:p.id,name:p.name,size:JSON.stringify(p).length*2})).sort((a,b)=>b.size-a.size),[projects]);
const total=useMemo(()=>used(),[projects,tick]);
const all=rows.length;const left=all-pick.length;
const tgl=(id:string)=>{setAsk(false);setPick(a=>a.includes(id)?a.filter(x=>x!==id):[...a,id])};
const go=()=>{if(!isOwner()){toast('Проект открыт в другой вкладке: забери управление');return}
if(left<1){toast('Один проект должен остаться');return}
pick.forEach(id=>del(id));setPick([]);setAsk(false);setTick(t=>t+1);toast('Удалено проектов: '+pick.length)};
return<>
<div className="set-row"><div><b>Занято на этом устройстве</b><p>{kb(total)} из примерно 5 МБ, которые даёт браузер. Отметь проекты, которые больше не нужны</p></div></div>
{rows.map(r=><label key={r.id} className="set-row fs-row"><div><b>{r.name}</b><p>{kb(r.size)}</p></div><input type="checkbox" className="sw" checked={pick.includes(r.id)} onChange={()=>tgl(r.id)}/></label>)}
{pick.length>0&&!ask&&<div className="btnrow"><button className="btn" onClick={onBackup}><Download size={16}/>Сначала скачать копию</button><button className="btn" disabled={left<1} onClick={()=>setAsk(true)}><Trash2 size={16}/>Удалить отмеченные ({pick.length})</button></div>}
{ask&&<div className="set-row"><div><b>Удалить проектов: {pick.length}?</b><p>Вернуть их будет нельзя, только из скачанной копии</p></div><div className="stack"><button className="btn" onClick={()=>setAsk(false)}>Отмена</button><button className="btn pri" onClick={go}>Удалить</button></div></div>}
</>}
