import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Bold,Italic,Underline,Strikethrough,AlignLeft,AlignCenter,AlignRight,List,ListOrdered,ListChecks,Link2,Unlink} from 'lucide-react';
import type {El} from '../../store';
import type {PStyle} from '../../lib/art';
import {resolve} from '../../lib/art';
import {editHtml,parseDom,toPatch,linkOk} from '../../lib/rich';
import type {LT} from '../../lib/rich';
import {LinkEditor} from './LinkEditor';
const SIZES=[12,13,14,16,18,20,24,32,40,48,56,72];
type St={b:boolean;i:boolean;u:boolean;s:boolean;a:boolean};
const cmd=(c:string,v?:string)=>{document.execCommand('styleWithCSS',false,'false');document.execCommand(c,false,v)};
/** правка текста на месте с мини-панелью (1.52): Ctrl+B/I/U, Ctrl+Shift+X зачёркнутый, Ctrl+K ссылка, Enter новая строка, Ctrl+Enter или Esc готово */
export function RichEdit({e,st,onPatch,onDone}:{e:El;st?:PStyle;onPatch:(p:Partial<El>)=>void;onDone:(text:string)=>void}){
const r=useRef<HTMLDivElement>(null);const bar=useRef<HTMLDivElement>(null);const fin=useRef(false);const rng=useRef<Range|null>(null);
const [act,setAct]=useState<St>({b:false,i:false,u:false,s:false,a:false});const [lk,setLk]=useState<string|null>(null);
const res=resolve(e,st);
useLayoutEffect(()=>{const n=r.current;if(!n)return;n.innerHTML=editHtml(e);n.focus();const g=window.getSelection();if(g){const rg=document.createRange();rg.selectNodeContents(n);g.removeAllRanges();g.addRange(rg)}},[]);
const lines=()=>{const L=parseDom(r.current as Node);while(L.length>1&&!L[L.length-1].length)L.pop();return L};
const commit=()=>onPatch(toPatch(lines()));
const done=()=>{if(fin.current)return;fin.current=true;const p=toPatch(lines());onPatch(p);onDone(p.text)};
const inEd=(n:Node|null)=>!!n&&!!r.current&&r.current.contains(n);
const refresh=()=>{const g=window.getSelection();if(!g||!g.anchorNode||!inEd(g.anchorNode))return;const q=(c:string)=>{try{return document.queryCommandState(c)}catch{return false}};
const an=g.anchorNode.nodeType===1?g.anchorNode as HTMLElement:g.anchorNode.parentElement;setAct({b:q('bold'),i:q('italic'),u:q('underline'),s:q('strikeThrough'),a:!!an?.closest('a')})};
useEffect(()=>{document.addEventListener('selectionchange',refresh);return()=>document.removeEventListener('selectionchange',refresh)},[]);
/* мини-панель над элементом; следует за ним при прокрутке и масштабе */
useEffect(()=>{let id=0;const tick=()=>{const b=bar.current,h=r.current?.closest('.el') as HTMLElement|null;if(b&&h){const q=h.getBoundingClientRect();const w=b.offsetWidth,bh=b.offsetHeight;let top=q.top-bh-10;if(top<8)top=q.bottom+10;if(top+bh>innerHeight-8)top=Math.max(8,innerHeight-bh-8);b.style.top=top+'px';b.style.left=Math.max(8,Math.min(q.left,innerWidth-w-8))+'px'}id=requestAnimationFrame(tick)};id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id)},[]);
const keep=()=>{r.current?.focus()};
const fmt=(c:string)=>{keep();cmd(c);commit();refresh()};
const openLink=()=>{const g=window.getSelection();if(!g||!g.anchorNode||!inEd(g.anchorNode))return;const an=g.anchorNode.nodeType===1?g.anchorNode as HTMLElement:g.anchorNode.parentElement;const a=an?.closest('a')??null;
if(a&&g.isCollapsed){const rg=document.createRange();rg.selectNodeContents(a);g.removeAllRanges();g.addRange(rg)}
if(g.isCollapsed){setLk('');rng.current=null;return}
rng.current=g.getRangeAt(0).cloneRange();setLk(a?.getAttribute('href')??'url:')};
const applyLink=(v:string|null)=>{keep();const g=window.getSelection();if(g&&rng.current){g.removeAllRanges();g.addRange(rng.current)}
if(v&&linkOk(v)&&rng.current)cmd('createLink',v);else if(rng.current)cmd('unlink');
commit();setLk(null);rng.current=null;refresh()};
const set=(p:Partial<El>)=>{onPatch(p);keep()};
const step=(d:number)=>{const cur=res.fs??16;const a=[...new Set([...SIZES,cur])].sort((x,y)=>x-y);const i=a.indexOf(cur);const n=a[Math.max(0,Math.min(a.length-1,i+d))];set({fs:n,role:undefined})};
const lt=(k:LT)=>set({lt:e.lt===k?undefined:k});
const B=(on:boolean,t:string,f:()=>void,c:React.ReactNode)=><button type="button" className={'rb'+(on?' on':'')} title={t} aria-label={t} aria-pressed={on} onClick={f}>{c}</button>;
const tb=<div ref={bar} className="rtb" role="toolbar" aria-label="Оформление текста" onMouseDown={ev=>{const t=ev.target as HTMLElement;if(t.tagName!=='INPUT'&&t.tagName!=='SELECT'&&t.tagName!=='OPTION')ev.preventDefault()}} onPointerDown={ev=>ev.stopPropagation()}>
<div className="rrow">{B(act.b,'Жирный (Ctrl+B)',()=>fmt('bold'),<Bold size={15}/>)}{B(act.i,'Курсив (Ctrl+I)',()=>fmt('italic'),<Italic size={15}/>)}{B(act.u,'Подчёркнутый (Ctrl+U)',()=>fmt('underline'),<Underline size={15}/>)}{B(act.s,'Зачёркнутый (Ctrl+Shift+X)',()=>fmt('strikeThrough'),<Strikethrough size={15}/>)}<i className="rsep"/>
<button type="button" className="rb" title="Меньше" aria-label="Меньше" onClick={()=>step(-1)}>A−</button><span className="rsz">{res.fs??16}</span><button type="button" className="rb" title="Больше" aria-label="Больше" onClick={()=>step(1)}>A+</button><i className="rsep"/>
{B(e.al!=='c'&&e.al!=='r','По левому краю',()=>set({al:undefined}),<AlignLeft size={15}/>)}{B(e.al==='c','По центру',()=>set({al:'c'}),<AlignCenter size={15}/>)}{B(e.al==='r','По правому краю',()=>set({al:'r'}),<AlignRight size={15}/>)}<i className="rsep"/>
{B(e.lt==='ul','Маркированный список',()=>lt('ul'),<List size={15}/>)}{B(e.lt==='ol','Нумерованный список',()=>lt('ol'),<ListOrdered size={15}/>)}{B(e.lt==='ck','Чек-лист',()=>lt('ck'),<ListChecks size={15}/>)}<i className="rsep"/>
{B(act.a,'Ссылка (Ctrl+K)',openLink,<Link2 size={15}/>)}{act.a&&B(false,'Убрать ссылку',()=>{const g=window.getSelection();const a=g?.anchorNode?(g.anchorNode.nodeType===1?g.anchorNode as HTMLElement:g.anchorNode.parentElement)?.closest('a'):null;if(g&&a&&g.isCollapsed){const rg=document.createRange();rg.selectNodeContents(a);g.removeAllRanges();g.addRange(rg)}keep();cmd('unlink');commit();refresh()},<Unlink size={15}/>)}</div>
<div className="rrow rcol"><span className="rcl">Цвет</span>{(st?.palette??[]).map(c=><button type="button" key={c} className={'cs'+(e.c?.toLowerCase()===c.toLowerCase()?' on':'')} style={{background:c}} title={c} aria-label={'Цвет '+c} onClick={()=>set({c})}/>)}<button type="button" className={'cs none'+(!e.c?' on':'')} title="Цвет по умолчанию" aria-label="Цвет по умолчанию" onClick={()=>set({c:undefined})}/></div>
{lk!==null&&<div className="rlk">{!rng.current?<p className="hint">Выдели слово или фразу в тексте, потом нажми значок ссылки.</p>:<><LinkEditor value={lk} onChange={setLk}/><div className="rrow"><button type="button" className="btn pri" disabled={!linkOk(lk)} onClick={()=>applyLink(lk)}>Готово</button><button type="button" className="btn" onClick={()=>setLk(null)}>Отмена</button></div></>}</div>}
</div>;
return<><div ref={r} className={'ied rte'+(e.lt?' '+e.lt:'')} contentEditable suppressContentEditableWarning spellCheck={false} role="textbox" aria-multiline="true" aria-label="Текст элемента"
onInput={commit}
onKeyDown={ev=>{ev.stopPropagation();const k=ev.key.toLowerCase();
if(ev.key==='Escape'){ev.preventDefault();if(lk!==null){setLk(null);keep();return}done();return}
if(ev.key==='Enter'&&(ev.ctrlKey||ev.metaKey)){ev.preventDefault();done();return}
if((ev.ctrlKey||ev.metaKey)&&k==='k'){ev.preventDefault();openLink();return}
if((ev.ctrlKey||ev.metaKey)&&ev.shiftKey&&k==='x'){ev.preventDefault();fmt('strikeThrough');return}
if((ev.ctrlKey||ev.metaKey)&&!ev.shiftKey&&(k==='b'||k==='i'||k==='u')){ev.preventDefault();fmt(k==='b'?'bold':k==='i'?'italic':'underline')}}}
onBlur={ev=>{const to=ev.relatedTarget as Node|null;if(to&&bar.current?.contains(to))return;done()}}
onPaste={ev=>{ev.preventDefault();const t=ev.clipboardData.getData('text/plain').replace(/\r/g,'');t.split('\n').forEach((p,i)=>{if(i)document.execCommand('insertParagraph');if(p)document.execCommand('insertText',false,p)})}}
onPointerDown={ev=>ev.stopPropagation()} onDoubleClick={ev=>ev.stopPropagation()} onContextMenu={ev=>ev.stopPropagation()}/>
{createPortal(tb,document.body)}</>}
