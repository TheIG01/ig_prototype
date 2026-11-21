import {AlignStartVertical,AlignCenterVertical,AlignEndVertical,AlignStartHorizontal,AlignCenterHorizontal,AlignEndHorizontal,AlignHorizontalSpaceBetween,AlignVerticalSpaceBetween,Group,Ungroup,Copy,Trash2,X} from 'lucide-react';
import {useStore} from '../../store';
import type {Dev} from '../../store';
import {uid} from '../../lib/uid';
import {NAME_NEW} from '../../lib/art';import {LayPanel} from './LayPanel';
const NM:Record<string,string>={text:'Текст',rect:'Прямоугольник',btn:'Кнопка',input:'Поле ввода',img:'Изображение',line:'Линия',...NAME_NEW};
type M='l'|'c'|'r'|'t'|'m'|'b'|'dh'|'dv';
const AL:[M,string,typeof AlignStartVertical][]=[['l','Влево (Alt+A)',AlignStartVertical],['c','По центру горизонтально (Alt+H)',AlignCenterVertical],['r','Вправо (Alt+D)',AlignEndVertical],['t','Вверх (Alt+W)',AlignStartHorizontal],['m','По центру вертикально (Alt+V)',AlignCenterHorizontal],['b','Вниз (Alt+S)',AlignEndHorizontal]];
/** right panel for several selected elements: align, distribute, group, copy, delete */
export function MultiPanel({dev,ids}:{dev:Dev;ids:string[]}){
const s=useStore();const sh=s.data?.projects.find(p=>p.id===s.projectId)?.sheets.find(x=>x.id===s.sheetId);
const els=(sh?.blocks??[]).flatMap(b=>b.els[dev]).filter(e=>ids.includes(e.id));const grouped=els.some(e=>e.g);
return<aside className="panel"><div className="ph"><b>Выбрано {ids.length}</b><span>Несколько элементов</span><button className="btn ic" onClick={()=>s.setMulti([])} aria-label="Снять выделение"><X size={14}/></button></div>
<div className="sec"><h4>Выравнивание</h4><div className="algrid">{AL.map(([m,t,I])=><button key={m} className="btn ic" title={t} onClick={()=>s.alignEls(dev,ids,m)}><I size={16}/></button>)}</div>
<div className="btnrow"><button className="btn" disabled={ids.length<3} title="Равные промежутки по горизонтали (Ctrl+Alt+H)" onClick={()=>s.alignEls(dev,ids,'dh')}><AlignHorizontalSpaceBetween size={16}/>По горизонтали</button><button className="btn" disabled={ids.length<3} title="Равные промежутки по вертикали (Ctrl+Alt+V)" onClick={()=>s.alignEls(dev,ids,'dv')}><AlignVerticalSpaceBetween size={16}/>По вертикали</button></div></div>
<div className="sec"><h4>Группа</h4><div className="btnrow"><button className="btn" title="Сгруппировать (Ctrl+G)" onClick={()=>s.groupEls(dev,ids,true)}><Group size={16}/>Сгруппировать</button><button className="btn" disabled={!grouped} title="Разгруппировать (Ctrl+Shift+G)" onClick={()=>s.groupEls(dev,ids,false)}><Ungroup size={16}/>Разгруппировать</button></div>
<p className="hint">Группа двигается и выделяется целиком. Ctrl+клик выбирает элемент внутри группы</p></div>
<LayPanel dev={dev} ids={ids}/>
<div className="sec"><div className="btnrow"><button className="btn" title="Дублировать (Ctrl+D)" onClick={()=>s.dupEls(dev,ids,16,ids.map(()=>uid()))}><Copy size={16}/>Дублировать</button><button className="btn danger" title="Удалить (Delete)" onClick={()=>s.delEls(dev,ids)}><Trash2 size={16}/>Удалить</button></div></div>
<div className="sec"><h4>Слои выделения</h4>{[...els].reverse().map(x=><button key={x.id} className="row sm" onClick={()=>s.setMulti([x.id])}><span>{NM[x.t]}{x.text?` · ${x.text.slice(0,24)}`:''}{x.g?' · группа':''}</span></button>)}</div></aside>}
