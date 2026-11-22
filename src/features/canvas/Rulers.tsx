import type {ReactElement,PointerEvent as RPE} from 'react';
import {useUi,saveUi} from '../../lib/ui';
import type {Ui} from '../../lib/ui';
const STEPS=[10,20,50,100,200,500,1000,2000];
/** линейка холста: деления в px макета, синяя полоса показывает выделение; потяни с неё, чтобы создать направляющую */
export function Ruler({vertical,len,z,range,onGuide}:{vertical?:boolean;len:number;z:number;range?:[number,number];onGuide?:(e:RPE)=>void}){
const major=STEPS.find(s=>s*z>=64)??2000;const minor=major/5;const mn=minor*z>=7;const stp=mn?minor:major;const n=Math.floor(len/stp);const size=len*z;
const out:ReactElement[]=[];
for(let i=0;i<=n;i++){const v=i*stp;const p=v*z;const big=v%major===0;
out.push(vertical?<line key={'l'+i} x1={big?9:16} x2={22} y1={p+.5} y2={p+.5}/>:<line key={'l'+i} x1={p+.5} x2={p+.5} y1={big?9:16} y2={22}/>);
if(big&&(!vertical||v>0))out.push(vertical?<text key={'t'+i} transform={`translate(10 ${p-3}) rotate(-90)`}>{v}</text>:<text key={'t'+i} x={p+3} y={11}>{v}</text>)}
const band=range?(vertical?<rect className="rl-band" x={0} y={range[0]*z} width={22} height={Math.max(1,(range[1]-range[0])*z)}/>:<rect className="rl-band" x={range[0]*z} y={0} width={Math.max(1,(range[1]-range[0])*z)} height={22}/>):null;
return<div className={'rl '+(vertical?'rl-v':'rl-h')} style={vertical?{height:size+1}:{width:size+1}} onPointerDown={onGuide} title={onGuide?'Потяни, чтобы создать направляющую':undefined}>
<svg width={vertical?22:size+1} height={vertical?size+1:22} aria-hidden="true">{band}{out}</svg></div>}
const ITEMS:[keyof Ui,string,string][]=[['rulers','Линейки','Shift+R'],['grid','Точечная сетка',"Ctrl+'"],['guides','Направляющие','Ctrl+;'],['cols','Колонки',"Ctrl+Shift+'"],['smart','Умные направляющие',''],['snap','Привязка к сетке',''],['hover','Подсветка при наведении',''],['dims','Размеры у выделения','']];
/** меню «Вид» над панелью инструментов, как в Figma */
export function ViewMenu({onClose}:{onClose:()=>void}){const u=useUi();
return<><div className="vm-bg" onPointerDown={onClose}/><div className="vmenu" role="menu">
{ITEMS.map(([k,l,h])=><button key={k} role="menuitemcheckbox" aria-checked={!!u[k]} className="vmi" onClick={()=>saveUi({[k]:!u[k]} as unknown as Partial<Ui>)}><i className={'ck'+(u[k]?' on':'')}>{u[k]?'✓':''}</i><span>{l}</span>{h&&<kbd>{h}</kbd>}</button>)}
<div className="vm-sep"/><div className="vm-row"><span>Шаг сетки</span><div className="seg">{([4,8,16] as const).map(n=><button key={n} className={u.gs===n?'on':''} onClick={()=>saveUi({gs:n})}>{n}</button>)}</div></div><div className="vm-row"><span>Колонки</span><div className="seg">{([[0,'Авто'],[4,'4'],[8,'8'],[12,'12']] as const).map(([k,l])=><button key={k} className={u.colsN===k&&u.cols?'on':''} onClick={()=>saveUi({colsN:k,cols:true})}>{l}</button>)}</div></div></div></>}
