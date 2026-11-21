import {useEffect,useState} from 'react';
import {useStore} from './store';
import {Pin} from './features/pin/Pin';
import {Shell} from './features/shell/Shell';
import {autoUnlock} from './lib/vault';
export default function App(){const data=useStore(s=>s.data);const load=useStore(s=>s.load);const [boot,setBoot]=useState(true);
useEffect(()=>{autoUnlock().then(d=>{if(d)load(d);setBoot(false)})},[]);
return boot?null:data?<Shell/>:<Pin onOk={load}/>}
