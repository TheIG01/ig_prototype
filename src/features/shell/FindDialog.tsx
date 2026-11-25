import {useMemo,useState,useDeferredValue} from 'react';
import {useStore} from '../../store';
import type {Project} from '../../store';
import {findAll} from '../../lib/findrep';
import {DEVS_SHORT} from '../../lib/dev';
import {toast} from '../../lib/toast';
const nn=(n:number,a:string,b:string,c:string)=>{const m=n%100,k=n%10;return n+' '+(m>10&&m<15?c:k===1?a:k>1&&k<5?b:c)};
/** окно «Найти и заменить»: список мест с предпросмотром, галочки на каждом месте */
export function FindDialog({pr,onClose}:{pr:Project;onClose:()=>void}){
const [q,setQ]=useState('');const [r,setR]=useState('');const [cs,setCs]=useState(false);const [word,setWord]=useState(false);const [off,setOff]=useState<string[]>([]);
const dq=useDeferredValue(q);
const rows=useMemo(()=>findAll(pr,dq,{cs,word}),[pr,dq,cs,word]);
const on=rows.filter(x=>!off.includes(x.key));
const cnt=on.reduce((a,x)=>a+x.count,0);
const sheets=[...new Set(rows.map(x=>x.sheetId))];
const tgl=(k:string)=>setOff(o=>o.includes(k)?o.filter(x=>x!==k):[...o,k]);
const open=(sid:string,bid:string)=>{const st=useStore.getState();st.setSheet(sid);st.setBlock(bid);onClose()};
const run=()=>{if(!on.length)return;const n=useStore.getState().findRep(q,r,{cs,word},off);
toast(n?'Заменено: '+n:'Замен не было',n?{label:'Отменить',run:()=>useStore.getState().undo()}:undefined,7000);if(n)onClose()};
return<div className="fnd">
<p className="txt">Ищет в текстах и кнопках на всех листах и устройствах, а ещё в тексте «Спасибо» и согласии формы. Ссылки кнопок (телефон, почта, адрес) не меняются: поправь их в панели элемента.</p>
<label className="fnd-f"><span>Найти</span><input className="inp" value={q} onChange={e=>{setQ(e.target.value);setOff([])}} placeholder="Например: название компании" autoFocus/></label>
<label className="fnd-f"><span>Заменить на</span><input className="inp" value={r} onChange={e=>setR(e.target.value)} placeholder="Пусто: удалить найденное"/></label>
<div className="fnd-o"><label><input type="checkbox" checked={cs} onChange={e=>setCs(e.target.checked)}/>Учитывать регистр</label><label><input type="checkbox" checked={word} onChange={e=>setWord(e.target.checked)}/>Слово целиком</label></div>
{!!q&&<p className="hint">{rows.length?'Найдено: '+nn(rows.reduce((a,x)=>a+x.count,0),'вхождение','вхождения','вхождений')+' на '+nn(sheets.length,'листе','листах','листах'):'Ничего не найдено'}</p>}
{!!rows.length&&<div className="fnd-l">{sheets.map(sid=><div key={sid} className="fnd-g"><h4>{rows.find(x=>x.sheetId===sid)?.sheet}</h4>
{rows.filter(x=>x.sheetId===sid).map(x=><div key={x.key} className={'fnd-r'+(off.includes(x.key)?' off':'')}>
<input type="checkbox" checked={!off.includes(x.key)} onChange={()=>tgl(x.key)} aria-label="Заменить здесь"/>
<div className="fnd-t"><small>{x.label} · {x.block}{x.devs.length?' · '+x.devs.map(d=>DEVS_SHORT[d]).join(', '):''}{x.count>1?' · ×'+x.count:''}</small>
<span>{x.pre}<del>{x.hit}</del>{r&&<ins>{r}</ins>}{x.post}</span></div>
<button className="btn" onClick={()=>open(x.sheetId,x.blockId)}>Открыть</button></div>)}</div>)}</div>}
<div className="btnrow"><button className="btn" onClick={onClose}>Закрыть</button><button className="btn pri" disabled={!on.length} onClick={run}>{on.length?(r?'Заменить':'Удалить')+' · '+cnt:'Заменить'}</button></div></div>}
