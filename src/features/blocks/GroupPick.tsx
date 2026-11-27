import {useState} from 'react';
import {FolderPlus} from 'lucide-react';
import {NOCAT} from '../../lib/tplLib';

/** выбор группы шаблона: кнопки существующих групп и «Новая группа». value '' это «Мои шаблоны» */
export function GroupPick({value,groups,onChange}:{value:string;groups:string[];onChange:(v:string)=>void}){
const list=groups.filter(c=>c!==NOCAT);const known=value===''||value===NOCAT||list.includes(value);
const [nw,setNw]=useState(!known);
const on=(v:string)=>(v===''?(value===''||value===NOCAT):value===v)&&!nw;
return<div className="gpk" role="group" aria-label="Группа шаблона"><span className="gpk-l">В какую группу добавить</span>
<div className="gpk-c"><button type="button" className={on('')?'on':''} aria-pressed={on('')} onClick={()=>{setNw(false);onChange('')}}>{NOCAT}</button>
{list.map(c=><button type="button" key={c} className={on(c)?'on':''} aria-pressed={on(c)} onClick={()=>{setNw(false);onChange(c)}}>{c}</button>)}
<button type="button" className={'gpk-n'+(nw?' on':'')} aria-pressed={nw} onClick={()=>{setNw(true);if(known)onChange('')}}><FolderPlus size={13}/>Новая группа</button></div>
{nw&&<input className="inp" autoFocus placeholder="Название новой группы" value={known?'':value} onChange={e=>onChange(e.target.value)}/>}</div>}
