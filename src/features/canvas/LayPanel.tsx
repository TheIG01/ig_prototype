import {ArrowDown,ArrowRight,Sparkles,X} from 'lucide-react';
import {useStore} from '../../store';
import type {Dev} from '../../store';
/** секция «Авто-лейаут»: включить для выделенных элементов или настроить уже включённый */
export function LayPanel({dev,ids,single}:{dev:Dev;ids:string[];single?:boolean}){
const s=useStore();const sh=s.data?.projects.find(p=>p.id===s.projectId)?.sheets.find(x=>x.id===s.sheetId);
const b=sh?.blocks.find(x=>x.els[dev].some(e=>ids.includes(e.id)));if(!b)return null;
const sel=b.els[dev].filter(e=>ids.includes(e.id));const g=sel[0]?.g;const gid=g&&sel.every(e=>e.g===g)?g:undefined;
const c=gid?b.lay?.[dev]?.[gid]:undefined;
if(!c||!gid){if(single||sel.length<2)return null;
return<div className="sec lay"><h4>Авто-лейаут</h4><button className="btn pri" disabled={sel.length<ids.length} title="Включить авто-лейаут (Shift+A)" onClick={()=>s.autoLay(dev,ids)}><Sparkles size={16}/>Включить авто-лейаут</button>
<p className="hint">Элементы встанут в колонку или строку с одинаковым отступом. Размер, порядок и удаление сами подтянут соседей. Shift+A</p></div>}
const set=(p:Partial<NonNullable<typeof c>>)=>s.setLay(dev,gid,p);const v=c.d==='v';
const AL=v?['Слева','Центр','Справа']:['Сверху','Центр','Снизу'];
return<div className="sec lay"><h4><span>Авто-лейаут</span><button className="btn ic" title="Убрать авто-лейаут (Shift+A)" onClick={()=>s.delLay(dev,gid)}><X size={14}/></button></h4>
<div className="seg">{([['v','Колонка',ArrowDown],['h','Строка',ArrowRight]] as const).map(([k,l,I])=><button key={k} className={c.d===k?'on':''} onClick={()=>set({d:k})}><I size={14}/>{l}</button>)}</div>
<label className="num wide"><span>Отступ</span><input type="number" min={0} max={200} step={4} value={c.gap} onChange={e=>set({gap:Math.max(0,Math.min(200,+e.target.value||0))})}/></label>
<div className="btnrow">{[4,8,12,16,24,32,48,64].map(n=><button key={n} className={'btn'+(c.gap===n?' on':'')} onClick={()=>set({gap:n})}>{n}</button>)}</div>
<div className="seg">{(['s','c','e'] as const).map((k,i)=><button key={k} className={c.al===k?'on':''} onClick={()=>set({al:k})}>{AL[i]}</button>)}</div>
<label className="lchk"><input type="checkbox" checked={!!c.mx} onChange={e=>set({mx:e.target.checked})}/>Центр по ширине блока</label>
<label className="lchk"><input type="checkbox" checked={!!c.fl} onChange={e=>set({fl:e.target.checked})}/>{v?'Одинаковая ширина':'Одинаковая высота'}</label>
<p className="hint">Ctrl+перетаскивание меняет порядок. Группа двигается целиком</p></div>}
