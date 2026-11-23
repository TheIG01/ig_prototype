import {useEffect,useState} from 'react';
import {Delete} from 'lucide-react';
import type {Data} from '../../store';
import {isOwner} from '../../lib/tabs';import {createVault,unlockVault,hasVault,rememberDevice,forgetDevice} from '../../lib/vault';
const empty:Data={schemaVersion:5,projects:[],siteTypes:[],blockTpls:[]};
export function Pin({onOk}:{onOk:(d:Data)=>void}){
const setup=!hasVault();const [rem,setRem]=useState(true);const remember=async()=>{if(rem){await rememberDevice();localStorage.setItem('igp.rem','1')}else{await forgetDevice();localStorage.removeItem('igp.rem')}};const [pin,setPin]=useState('');const [first,setFirst]=useState('');const [err,setErr]=useState(false);const [msg,setMsg]=useState('');
const press=(d:string)=>{if(pin.length<6)setPin(pin+d)};
const fail=(m:string)=>{setErr(true);setMsg(m);setPin('');setTimeout(()=>setErr(false),350)};
const go=async()=>{if(pin.length<4)return fail('Минимум 4 цифры');
if(setup){if(!first){setFirst(pin);setPin('');return}if(first!==pin){setFirst('');return fail('ПИН не совпал, начните заново')}if(!isOwner())return fail('Проект открыт в другой вкладке: закрой её и обнови эту');await createVault(pin,empty);await remember();onOk(empty)}
else{const d=await unlockVault(pin);if(d){await remember();onOk(d)}else fail('Неверный ПИН')}};
useEffect(()=>{const h=(e:KeyboardEvent)=>{if(/^\d$/.test(e.key))press(e.key);else if(e.key==='Backspace')setPin(p=>p.slice(0,-1));else if(e.key==='Enter')go()};addEventListener('keydown',h);return()=>removeEventListener('keydown',h)});
return<div className="pin"><div className="pin-card"><div className="logo">IG</div>
<h1>{setup?(first?'Повторите ПИН':'Придумайте ПИН'):'Введите ПИН'}</h1><p>{msg||(setup?'4–6 цифр. Он шифрует все данные на устройстве':'IG prototype')}</p>
<div className={'dots'+(err?' err':'')}>{Array.from({length:6},(_,i)=><i key={i} className={i<pin.length?'on':''}/>)}</div>
<div className="keys">{[1,2,3,4,5,6,7,8,9].map(n=><button key={n} onClick={()=>press(String(n))}>{n}</button>)}
<button onClick={()=>setPin(pin.slice(0,-1))} aria-label="Стереть"><Delete size={20}/></button><button onClick={()=>press('0')}>0</button><button onClick={go} style={{background:'var(--acc)',color:'#fff'}}>OK</button></div>
<label className="rem"><input type="checkbox" className="sw" checked={rem} onChange={e=>setRem(e.target.checked)}/>Запомнить это устройство</label>
{setup&&<small>Забытый ПИН не восстановить без резервной копии</small>}</div></div>}

