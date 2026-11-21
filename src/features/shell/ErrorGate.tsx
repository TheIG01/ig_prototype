import {Component,type ReactNode} from 'react';
import {exportBackup} from '../../lib/vault';import {download} from '../../lib/export';
type S={err:Error|null};
const box:React.CSSProperties={minHeight:'100vh',display:'grid',placeItems:'center',background:'var(--bg)',padding:24,fontFamily:'Inter,system-ui,sans-serif',color:'var(--text)'};
const card:React.CSSProperties={background:'var(--card)',borderRadius:16,padding:28,maxWidth:460,width:'100%',boxShadow:'var(--pop)'};
const btn=(primary:boolean):React.CSSProperties=>({height:40,padding:'0 18px',borderRadius:999,border:primary?'none':'1px solid var(--line)',background:primary?'var(--acc)':'var(--card)',color:primary?'#fff':'var(--text)',font:'600 13px Inter,system-ui,sans-serif',cursor:'pointer'});
/** Catches render crashes so the screen is never blank; offers backup + cache reset. */
export class ErrorGate extends Component<{children:ReactNode},S>{
state:S={err:null};
static getDerivedStateFromError(err:Error):S{return{err}}
async resetCache(){try{const r=await navigator.serviceWorker?.getRegistrations();await Promise.all((r??[]).map(x=>x.unregister()));const k=await caches?.keys();await Promise.all((k??[]).map(x=>caches.delete(x)))}catch{}location.reload()}
render(){if(!this.state.err)return this.props.children;
return<div style={box}><div style={card}>
<div style={{font:'700 20px Inter,system-ui,sans-serif',marginBottom:8}}>Что-то пошло не так</div>
<div style={{color:'var(--mute)',fontSize:14,lineHeight:1.5,marginBottom:16}}>Данные на устройстве целы. Скачай копию, затем сбрось кэш приложения и открой сайт снова.</div>
<pre style={{background:'var(--bg)',borderRadius:10,padding:10,fontSize:12,whiteSpace:'pre-wrap',margin:'0 0 16px',maxHeight:120,overflow:'auto'}}>{String(this.state.err.message)}</pre>
<div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
<button style={btn(true)} onClick={()=>location.reload()}>Перезагрузить</button>
<button style={btn(false)} onClick={()=>download('ig_prototype_backup.json',exportBackup(),'application/json')}>Скачать копию</button>
<button style={btn(false)} onClick={()=>this.resetCache()}>Сбросить кэш</button>
</div></div></div>}}
