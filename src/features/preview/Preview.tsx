import {useEffect} from 'react';
import {X} from 'lucide-react';
export function Preview({html,onClose}:{html:string;onClose:()=>void}){
useEffect(()=>{const m=(e:MessageEvent)=>{if(e.data==='igp-close')onClose()};const k=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};
addEventListener('message',m);addEventListener('keydown',k);return()=>{removeEventListener('message',m);removeEventListener('keydown',k)}});
return<div className="pv"><iframe title="Просмотр" srcDoc={html} sandbox="allow-scripts"/><button className="btn pvx" onClick={onClose}><X size={16}/>Закрыть (Esc)</button></div>}
