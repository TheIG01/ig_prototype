import {useState} from 'react';
import {Plus,Save,X} from 'lucide-react';
import type {El} from '../../store';
import {cmpHtml,TAB_PRESETS,TAB_STYLES,tabItems,tabSize} from '../../lib/cmp';import type {CP} from '../../lib/cmp';
import {toast} from '../../lib/toast';

type Mine={id:string;name:string;cp:CP;w:number;h:number};
const KEY='ig.tabs.mine';
const load=():Mine[]=>{try{const v=JSON.parse(localStorage.getItem(KEY)??'[]');return Array.isArray(v)?v.filter((x:Mine)=>x&&x.cp&&x.cp.k==='tabs'&&typeof x.name==='string'):[]}catch{return[]}};
const save=(l:Mine[])=>{try{localStorage.setItem(KEY,JSON.stringify(l));return true}catch{return false}};
const mkCp=(p:Partial<CP>,n:number,items?:string[]):CP=>({k:'tabs',items:items??tabItems(n),...p} as CP);
const elOf=(c:CP):Partial<El>=>{const [w,h]=tabSize((c.items??[]).length,c.o==='v'?'v':'h');return{cp:c,text:'',w,h}};

/** миниатюра табов: настоящая разметка, уменьшенная */
function Pv({c}:{c:CP}){const e={id:'p',t:'cmp',x:0,y:0,w:440,h:170,text:'',cp:c} as El;const k=.34;
return<span className="tb-pv"><span className="tb-in" style={{transform:`scale(${k})`}} dangerouslySetInnerHTML={{__html:cmpHtml(e)}}/></span>}

/** панель «Табы»: готовые виды, свой вид (расположение, вид, число, названия) и сохранённые виды */
export default function TabsBuilder({onPick}:{onPick:(t:El['t'],x:Partial<El>)=>void}){
const [o,setO]=useState<'h'|'v'>('h');const [s,setS]=useState<NonNullable<CP['s']>>('line');const [side,setSide]=useState<'s'|'e'>('s');const [al,setAl]=useState<'s'|'c'|'f'>('s');
const [n,setN]=useState(3);const [names,setNames]=useState('');const [mine,setMine]=useState<Mine[]>(load);const [nm,setNm]=useState<string|null>(null);
const titles=names.split('\n').map(x=>x.trim()).filter(Boolean);
const items=()=>{const t=titles.length?titles:Array.from({length:n},(_,i)=>`Вкладка ${i+1}`);return t.slice(0,8).map((x,i)=>x.includes('|')?x:`${x} | Текст вкладки ${i+1}`)};
const cur=():CP=>mkCp({o,s,...(o==='v'&&side==='e'?{p:'e' as const}:{}),...(o==='h'&&al!=='s'?{a:al}:{})},n,items());
const count=titles.length||n;
const put=(c:CP)=>{onPick('cmp',elOf(c));toast('Табы добавлены. Название и текст каждой вкладки правятся справа, в «Компоненте»')};
const saveMine=()=>{const name=(nm??'').trim();if(!name){toast('Напиши название вида');return}const [w,h]=tabSize(count,o);const l=[{id:Date.now().toString(36),name,cp:cur(),w,h},...mine].slice(0,24);setMine(l);setNm(null);toast(save(l)?`Вид «${name}» сохранён`:'Браузер не дал сохранить вид на устройстве')};
const del=(id:string)=>{const l=mine.filter(x=>x.id!==id);setMine(l);save(l)};
const sg=(on:boolean,t:string,f:()=>void)=><button type="button" key={t} className={on?'on':''} aria-pressed={on} onClick={f}>{t}</button>;
return<div className="sc tb-b">
<p className="ins-t">Готовые виды</p>
<div className="ins-g c2 tb-g">{TAB_PRESETS.map(p=>{const c=mkCp(p.cp,3);return<button key={p.id} type="button" className="cell tall" title={p.name} onClick={()=>put(c)}><Pv c={c}/><small>{p.name}</small></button>})}</div>
{mine.length>0&&<><p className="ins-t">Мои виды</p><div className="ins-g c2 tb-g">{mine.map(m=><div key={m.id} className="elib-w"><button type="button" className="cell tall" title={m.name} onClick={()=>put(m.cp)}><Pv c={m.cp}/><small>{m.name}</small></button><span className="elib-a"><button type="button" title="Удалить вид" aria-label="Удалить вид" onClick={()=>del(m.id)}><X size={11}/></button></span></div>)}</div></>}
<p className="ins-t">Свой вид</p>
<div className="tb-f">
<div className="tb-r"><span>Расположение</span><div className="seg">{sg(o==='h','Сверху',()=>setO('h'))}{sg(o==='v','Сбоку',()=>setO('v'))}</div></div>
<div className="tb-r"><span>Вид</span><div className="seg">{TAB_STYLES.map(([v,t])=>sg(s===v,t,()=>setS(v)))}</div></div>
{o==='h'?<div className="tb-r"><span>Выравнивание</span><div className="seg">{sg(al==='s','Слева',()=>setAl('s'))}{sg(al==='c','Центр',()=>setAl('c'))}{sg(al==='f','Во всю ширину',()=>setAl('f'))}</div></div>
:<div className="tb-r"><span>Сторона</span><div className="seg">{sg(side==='s','Слева',()=>setSide('s'))}{sg(side==='e','Справа',()=>setSide('e'))}</div></div>}
<div className="tb-r"><span>Вкладок</span><div className="seg">{[2,3,4,5,6].map(v=>sg(!titles.length&&n===v,String(v),()=>{setN(v);setNames('')}))}</div></div>
<textarea className="inp" rows={3} placeholder={'Свои названия, по одному на строку\nНапример:\nОписание\nСостав\nОтзывы'} value={names} onChange={e=>setNames(e.target.value)}/>
<div className="tb-pvbig"><Pv c={cur()}/></div>
<div className="btnrow"><button type="button" className="btn pri" onClick={()=>put(cur())}><Plus size={14}/>Добавить на холст</button>
{nm===null?<button type="button" className="btn" onClick={()=>setNm('')}><Save size={14}/>Сохранить вид</button>:<input className="inp" autoFocus placeholder="Название вида" value={nm} onChange={e=>setNm(e.target.value)} onBlur={()=>{if(!nm.trim())setNm(null)}} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();saveMine()}if(e.key==='Escape')setNm(null)}}/>}</div></div></div>}
