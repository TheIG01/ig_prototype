import {useLayoutEffect,useRef} from 'react';
/** types whose text is edited right on the canvas (double click or Enter) */
export const INLINE=new Set<string>(['text','btn','input','rect','img','list']);
/** in-place text editor (Figma-like): lives inside the element, plain text only.
 *  Enter = new line (button and field: finish), Ctrl+Enter or Esc or click outside = finish. */
export function InlineEdit({text,single,onText,onDone}:{text:string;single:boolean;onText:(t:string)=>void;onDone:(t:string)=>void}){
const r=useRef<HTMLSpanElement>(null);const fin=useRef(false);
useLayoutEffect(()=>{const n=r.current;if(!n)return;n.textContent=text;n.focus();const g=window.getSelection();if(g){const rg=document.createRange();rg.selectNodeContents(n);g.removeAllRanges();g.addRange(rg)}},[]);
const read=()=>{let t=(r.current?.innerText??'').replace(/\r/g,'');if(t.endsWith('\n'))t=t.slice(0,-1);return single?t.replace(/\n+/g,' '):t};
const done=()=>{if(fin.current)return;fin.current=true;onDone(read())};
return<span ref={r} className="ied" contentEditable="plaintext-only" suppressContentEditableWarning spellCheck={false} role="textbox" aria-label="Текст элемента"
onInput={()=>onText(read())}
onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();done();return}if(e.key==='Enter'&&(e.ctrlKey||e.metaKey||(single&&!e.shiftKey))){e.preventDefault();done()}}}
onBlur={done}
onPaste={e=>{e.preventDefault();const t=e.clipboardData.getData('text/plain');document.execCommand('insertText',false,single?t.replace(/\s*\n+\s*/g,' '):t)}}
onPointerDown={e=>e.stopPropagation()} onDoubleClick={e=>e.stopPropagation()} onContextMenu={e=>e.stopPropagation()}/>}
