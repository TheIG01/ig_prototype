import {useMemo,useState} from 'react';
import {Copy,Download} from 'lucide-react';
import type {Project} from '../../store';
import {aiPrompt,aiFiles,AI_SVCS} from '../../lib/aiPrompt';
import type {AiSvc} from '../../lib/aiPrompt';
import {download} from '../../lib/export';
import {toast} from '../../lib/toast';
const KEY='igp.ai';
const start=():AiSvc=>{try{const v=localStorage.getItem(KEY);if(v==='claude'||v==='v0'||v==='lovable'||v==='cursor')return v}catch{/* память недоступна */}return'claude'};
export function AiDialog({pr,typeName}:{pr:Project;typeName:string}){
const [svc,setSvc]=useState<AiSvc>(start);
const text=useMemo(()=>aiPrompt(pr,typeName,svc),[pr,typeName,svc]);
const info=AI_SVCS.find(x=>x.id===svc)!;
const pick=(s:AiSvc)=>{setSvc(s);try{localStorage.setItem(KEY,s)}catch{/* память недоступна */}};
const copy=async()=>{try{await navigator.clipboard.writeText(text);toast('Промпт скопирован. Вставь его в '+info.name)}catch{toast('Не получилось скопировать. Выдели текст и нажми Ctrl+C')}};
const file=()=>{download('prompt_'+svc+'.md',text,'text/markdown');toast('Промпт скачан')};
const pack=()=>{aiFiles(pr,typeName).forEach((f,i)=>setTimeout(()=>download(f.name,f.text,f.type),i*300));toast('Скачиваю brief.md, spec.json и project.json')};
const kb=Math.max(1,Math.round(text.length/1024));
return<div className="aid">
<div className="seg aid-seg">{AI_SVCS.map(x=><button key={x.id} className={svc===x.id?'on':''} onClick={()=>pick(x.id)}>{x.name}</button>)}</div>
<p className="txt">{info.note}</p>
<textarea className="inp aid-t" readOnly value={text} onFocus={e=>e.currentTarget.select()}/>
<p className="hint aid-n">{kb} КБ{svc==='cursor'?'. Сначала скачай три файла и положи их в папку docs проекта':kb>60?'. Промпт большой: если сервис его не принимает, возьми вариант Cursor или режь проект по листам':''}</p>
<div className="btnrow"><button className="btn" onClick={pack}><Download size={16}/>Три файла</button><button className="btn" onClick={file}><Download size={16}/>Промпт файлом</button><button className="btn pri" onClick={()=>void copy()}><Copy size={16}/>Скопировать промпт</button></div></div>}
