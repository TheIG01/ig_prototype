import {useState} from 'react';
import {ChevronRight,ChevronDown,Group,Type,Square,RectangleHorizontal,TextCursorInput,Image as ImageIc,Minus,Shapes,Sparkles,Smartphone,List} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import {useStore,onDev} from '../../store';
import type {Dev,El,Sheet} from '../../store';
import {pickIds,modsOf,curSel} from '../../lib/select';
import {LayerBtns} from '../canvas/LayerBtns';
const IC:Record<string,LucideIcon>={text:Type,rect:Square,btn:RectangleHorizontal,input:TextCursorInput,img:ImageIc,line:Minus,shape:Shapes,icon:Sparkles,mock:Smartphone,list:List};
const NM:Record<string,string>={text:'Текст',rect:'Рамка',btn:'Кнопка',input:'Поле',img:'Картинка',line:'Линия',shape:'Фигура',icon:'Иконка',mock:'Мокап',list:'Список'};
/** вкладка «Слои» левой панели: блоки → группы → элементы текущего листа. Группа свёрнута одной строкой по умолчанию */
export function LayersTab({sheet,dev}:{sheet:Sheet;dev:Dev}){
const s=useStore();const [open,setOpen]=useState<Record<string,boolean>>({});const sel=curSel(s.multi,s.elId);
const isOpen=(id:string,def:boolean)=>open[id]??def;const tg=(id:string,def:boolean)=>setOpen(o=>({...o,[id]:!(o[id]??def)}));
const blocks=sheet.blocks.filter(b=>onDev(b,dev));
if(!blocks.length)return<p className="hint">На листе нет блоков. Добавь первый блок кнопкой на холсте.</p>;
const pick=(bid:string,all:El[],e:React.MouseEvent,id:string)=>{if(s.editId!==bid)s.enterEdit(bid);s.setMulti(pickIds(all,sel,s.elId,id,modsOf(e)))};
const pickGroup=(bid:string,ms:El[])=>{if(s.editId!==bid)s.enterEdit(bid);s.setMulti(ms.map(m=>m.id))};
const elRow=(b:{id:string},all:El[],x:El,cls:string)=>{const I=IC[x.t]??Shapes;
return<div key={x.id} className={'row sm '+cls+(sel.includes(x.id)?' on':'')+(x.hid?' off':'')} role="button" tabIndex={0} title={(NM[x.t]??x.t)+(x.text?' · '+x.text:'')+' (Shift: диапазон, Ctrl: добавить или убрать)'} onClick={e=>pick(b.id,all,e,x.id)}><I size={14}/><span>{NM[x.t]??x.t}{x.text?' · '+x.text:''}</span><LayerBtns dev={dev} els={[x]}/></div>};
return<div className="lt">{blocks.map((b,i)=>{const all=b.els[dev];const on=isOpen(b.id,b.id===s.blockId||b.id===s.editId);const rev=[...all].reverse();const seen=new Set<string>();
const rows:React.ReactNode[]=[];
if(on)for(const x of rev){
if(x.g){const ms=all.filter(q=>q.g===x.g);if(ms.length>1){if(seen.has(x.g))continue;seen.add(x.g);const gid=x.g;const go=isOpen(gid,false);
const gs=ms.some(m=>sel.includes(m.id))&&ms.every(m=>sel.includes(m.id));
rows.push(<div key={'g'+gid}><div className={'row sm lt-e'+(gs?' on':'')+(ms.every(m=>m.hid)?' off':'')} role="button" tabIndex={0} title="Группа. Клик выделяет всю группу" onClick={()=>pickGroup(b.id,ms)}><span className="lt-tg" onClick={e=>{e.stopPropagation();tg(gid,false)}}>{go?<ChevronDown size={14}/>:<ChevronRight size={14}/>}</span><Group size={14}/><span>Группа · {ms.length}</span><LayerBtns dev={dev} els={ms}/></div>
{go&&[...ms].reverse().map(m=>elRow(b,all,m,'lt-g'))}</div>);continue}}
rows.push(elRow(b,all,x,'lt-e'))}
return<div key={b.id}><div className={'row sm'+(b.id===s.blockId?' on':'')} role="button" tabIndex={0} title={`${i+1}. ${b.title}`} onClick={()=>s.setBlock(b.id)}>
<span className="lt-tg" title={on?'Свернуть':'Развернуть'} onClick={e=>{e.stopPropagation();tg(b.id,b.id===s.blockId||b.id===s.editId)}}>{on?<ChevronDown size={14}/>:<ChevronRight size={14}/>}</span><b className="no">{i+1}</b><span>{b.title}</span><em className="dvt">{all.length}</em></div>{on&&rows}</div>})}</div>}
