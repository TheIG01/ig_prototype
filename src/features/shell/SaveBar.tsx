import {useState} from 'react';
import {Download,RefreshCw,Lock} from 'lucide-react';
import {useStore} from '../../store';
import {useTab,takeOver} from '../../lib/tabs';
import {exportCurrent,exportBackup} from '../../lib/vault';
import {toast} from '../../lib/toast';
import {bakDone,bakDue,bakLater,bakGet,writeDir} from '../../lib/autobak';
/** скачать копию из памяти: работает, даже когда запись в браузер не проходит */
export async function downloadCopy(){
const own=useTab.getState().mode==='own';
try{const t=own?await exportCurrent(useStore.getState().data):exportBackup();
const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'application/json'}));a.download='ig_prototype_backup.json';a.click();bakDone();
setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
catch{toast('Копия не скачалась: попробуй ещё раз')}}
/** полоса под шапкой: красная при ошибке записи, синяя во второй вкладке */
export function SaveBar(){
const err=useStore(s=>s.saveErr);const retry=useStore(s=>s.retryNow);const mode=useTab(s=>s.mode);const [busy,setBusy]=useState(false);
const take=async()=>{setBusy(true);try{await takeOver();toast('Управление у тебя: данные обновлены')}finally{setBusy(false)}};
if(mode==='ro')return<div className="sbar ro" role="status"><Lock size={16}/><span><b>Проект открыт в другой вкладке</b>Здесь только чтение, правки не сохранятся.</span><button className="btn pri" disabled={busy} onClick={take}>{busy?'Забираю…':'Забрать управление'}</button></div>;
if(!err)return null;
return<div className="sbar bad" role="alert"><span><b>{err==='quota'?'Не сохранено: нет места в браузере':'Не сохранено: браузер не принял запись'}</b>Работа остаётся на экране. Скачай копию, не закрывай вкладку. Повторяю запись сам.</span><button className="btn" onClick={retry}><RefreshCw size={16}/>Повторить запись</button><button className="btn pri" onClick={()=>void downloadCopy()}><Download size={16}/>Скачать копию</button></div>}

/** раз в неделю: напомнить про копию; если выбрана папка, пишет туда */
export function BakBar(){
const has=useStore(s=>!!s.data&&s.data.projects.length>0);const mode=useTab(s=>s.mode);const err=useStore(s=>s.saveErr);
const [show,setShow]=useState(()=>bakDue());const [busy,setBusy]=useState(false);
if(!show||!has||mode==='ro'||err)return null;
const dir=bakGet().dir;
const save=async()=>{setBusy(true);try{if(dir){const t=await exportCurrent(useStore.getState().data);if(await writeDir(t)){toast('Копия записана в папку «'+dir+'»');setShow(false);return}toast('Папка не открылась. Скачиваю файлом')}await downloadCopy();setShow(false)}finally{setBusy(false)}};
return<div className="sbar bak" role="status"><Download size={16}/><span><b>Прошла неделя с последней копии</b>Копия защитит проект, если браузер очистит данные.</span><button className="btn pri" disabled={busy} onClick={()=>void save()}>{dir?'Записать в «'+dir+'»':'Скачать копию'}</button><button className="btn" onClick={()=>{bakLater();setShow(false)}}>Напомнить завтра</button></div>}
