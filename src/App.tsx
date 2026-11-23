import {useEffect,useState} from 'react';
import {useStore} from './store';
import {Pin} from './features/pin/Pin';
import {Shell} from './features/shell/Shell';import {ErrorGate} from './features/shell/ErrorGate';
import {autoUnlock} from './lib/vault';import {claim} from './lib/tabs';
export default function App(){const data=useStore(s=>s.data);const load=useStore(s=>s.load);const [boot,setBoot]=useState(true);
useEffect(()=>{claim().then(()=>autoUnlock()).then(d=>{if(d)load(d);setBoot(false)})},[]);
return<ErrorGate>{boot?null:data?<Shell/>:<Pin onOk={load}/>}</ErrorGate>}
