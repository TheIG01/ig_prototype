import {useState} from 'react';
import {Download,RefreshCw,Lock} from 'lucide-react';
import {useStore} from '../../store';
import {useTab,takeOver} from '../../lib/tabs';
import {exportCurrent,exportBackup} from '../../lib/vault';
import {toast} from '../../lib/toast';
/** скачать копию из памяти: работает, даже когда запись в браузер не проходит */
export async function downloadCopy(){
const own=useTab.getState().mode==='own';
try{const t=own?await exportCurrent(useStore.getState().data):exportBackup();
const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'application/json'}));a.download='ig_prototype_backup.json';a.click();
setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
catch{toast('Копия не скачалась: попробуй ещё раз')}}
/** полоса под шапкой: красная при ошибке записи, синяя во второй вкладке */
export function SaveBar(){
const err=useStore(s=>s.saveErr);const retry=useStore(s=>s.retryNow);const mode=useTab(s=>s.mode);const [busy,setBusy]=useState(false);
const take=async()=>{setBusy(true);try{await takeOver();toast('Управление у тебя: данные обновлены')}finally{setBusy(false)}};
if(mode==='ro')return<div className="sbar ro" role="status"><Lock size={16}/><span><b>Проект открыт в другой вкладке</b>Здесь только чтение, правки не сохранятся.</span><button className="btn pri" disabled={busy} onClick={take}>{busy?'Забираю…':'Забрать управление'}</button></div>;
if(!err)return null;
return<div className="sbar bad" role="alert"><span><b>{err==='quota'?'Не сохранено: нет места в браузере':'Не сохранено: браузер не принял запись'}</b>Работа остаётся на экране. Скачай копию, не закрывай вкладку. Повторяю запись сам.</span><button className="btn" onClick={retry}><RefreshCw size={16}/>Повторить запись</button><button className="btn pri" onClick={()=>void downloadCopy()}><Download size={16}/>Скачать копию</button></div>}
