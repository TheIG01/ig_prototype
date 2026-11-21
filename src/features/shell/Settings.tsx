import {useState} from 'react';
import {LogOut,Trash2,Download} from 'lucide-react';
import {forgetDevice,rememberDevice,wipe,lock} from '../../lib/vault';
export function SettingsBody({onBackup}:{onBackup:()=>void}){
const [rem,setRem]=useState(!!localStorage.getItem('igp.rem'));const [word,setWord]=useState('');const [del,setDel]=useState(false);
const toggle=async(v:boolean)=>{setRem(v);if(v){await rememberDevice();localStorage.setItem('igp.rem','1')}else{await forgetDevice();localStorage.removeItem('igp.rem')}};
const out=async()=>{await forgetDevice();localStorage.removeItem('igp.rem');lock();location.reload()};
const kill=async()=>{await wipe();location.reload()};
return<div>
<div className="set-row"><div><b>Запоминать это устройство</b><p>Вход без ПИН. Любой, кто откроет этот браузер, увидит данные</p></div><input type="checkbox" className="sw" checked={rem} onChange={e=>toggle(e.target.checked)}/></div>
<div className="set-row"><div><b>Выйти</b><p>Устройство забудется, при входе потребуется ПИН</p></div><button className="btn" onClick={out}><LogOut size={16}/>Выйти</button></div>
<div className="set-row" style={{border:0,flexDirection:'column'}}><div><b>Удалить аккаунт</b><p>Все проекты на этом устройстве сотрутся, затем можно создать новый ПИН</p></div>
{!del?<button className="btn danger" onClick={()=>setDel(true)}><Trash2 size={16}/>Удалить аккаунт</button>:<>
<button className="btn" onClick={onBackup}><Download size={16}/>Скачать копию перед удалением</button>
<input className="inp" placeholder="Введите УДАЛИТЬ" value={word} onChange={e=>setWord(e.target.value)}/>
<button className="btn danger" disabled={word.trim().toUpperCase()!=='УДАЛИТЬ'} onClick={kill}><Trash2 size={16}/>Удалить безвозвратно</button></>}</div></div>}
