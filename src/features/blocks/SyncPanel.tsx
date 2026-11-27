import {useState} from 'react';
import {Cloud,CloudOff,RefreshCw,Copy,Check,AlertTriangle,Loader2} from 'lucide-react';
import {useSync,connect,disconnect,syncNow,codeOf} from '../../lib/sync';
import {toast} from '../../lib/toast';

const ago=(t:number)=>{if(!t)return'';const s=Math.round((Date.now()-t)/1000);return s<10?'только что':s<60?s+' с назад':s<3600?Math.round(s/60)+' мин назад':new Date(t).toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'})};

/** кнопка-индикатор в панели библиотеки */
export function SyncChip({open,onClick}:{open:boolean;onClick:()=>void}){
const {st,last,err}=useSync();
const L=st==='off'?'Синхронизация: выкл':st==='sync'?'Синхронизация…':st==='err'?'Ошибка синхронизации':'На всех устройствах';
const I=st==='off'?CloudOff:st==='sync'?Loader2:st==='err'?AlertTriangle:Cloud;
return<button type="button" className={'syncchip '+st+(open?' on':'')} aria-expanded={open} title={st==='err'?err:st==='idle'?'Обновлено '+ago(last):'Библиотека на всех устройствах'} onClick={onClick}><I size={14} className={st==='sync'?'spin':''}/>{L}</button>}

/** подключение и управление синхронизацией */
export function SyncPanel({onClose}:{onClose:()=>void}){
const {st,last,err,gist}=useSync();const [v,setV]=useState('');const [busy,setBusy]=useState(false);const [cp,setCp]=useState(false);const [e2,setE2]=useState('');
const on=st!=='off';
const go=async()=>{setBusy(true);setE2('');try{await connect(v);setV('');toast('Синхронизация включена')}catch(x){setE2(x instanceof Error?x.message:'Не получилось')}setBusy(false)};
const copy=async()=>{try{await navigator.clipboard.writeText(codeOf());setCp(true);setTimeout(()=>setCp(false),2000)}catch{toast('Не удалось скопировать: выдели код вручную')}};
return<div className="syncp" role="region" aria-label="Синхронизация библиотеки">
<div className="syncp-h"><b>Библиотека на всех устройствах</b><button type="button" className="btn ic" aria-label="Закрыть" onClick={onClose}>×</button></div>
{!on?<>
<p>Шаблоны, группы, порядок и избранное сохраняются в твой приватный GitHub Gist, зашифрованные. Правка на одном устройстве появляется на остальных за секунды.</p>
<ol>
<li>Создай токен: <a href="https://github.com/settings/tokens/new?scopes=gist&description=ig_prototype" target="_blank" rel="noreferrer">github.com/settings/tokens/new</a>, поставь галочку «gist», срок «No expiration».</li>
<li>Вставь токен ниже. На втором устройстве вставь код подключения с первого.</li></ol>
<div className="syncp-row"><input className="inp" type="password" autoComplete="off" placeholder="Токен GitHub или код подключения" value={v} onChange={x=>setV(x.target.value)} onKeyDown={x=>{if(x.key==='Enter'){x.preventDefault();void go()}}}/><button type="button" className="btn pri" disabled={busy||!v.trim()} onClick={()=>void go()}>{busy?'Подключаю…':'Включить'}</button></div>
{e2&&<p className="syncp-err">{e2}</p>}
</>:<>
<p className={st==='err'?'syncp-err':''}>{st==='err'?err:st==='sync'?'Синхронизирую…':'Всё синхронизировано'+(last?': '+ago(last):'')}</p>
<div className="syncp-row"><button type="button" className="btn" onClick={()=>void syncNow(true)}><RefreshCw size={14}/>Обновить сейчас</button><button type="button" className="btn" onClick={()=>void copy()}>{cp?<Check size={14}/>:<Copy size={14}/>}Код для другого устройства</button><button type="button" className="btn" onClick={()=>{void disconnect();toast('Синхронизация выключена, шаблоны остались на этом устройстве')}}>Выключить</button></div>
<small>Код подключения даёт доступ к библиотеке: не показывай его другим. Gist: {gist.slice(0,8)}…</small>
</>}
</div>}
