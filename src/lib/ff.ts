import type {El} from '../store';
/** Настройки поля формы (тип `input`): вид поля, название, подсказка, значение, обязательность, маска, сообщение об ошибке */
export interface FF{k:string;nm?:string;hint?:string;def?:string;req?:1;mask?:string;err?:string;opts?:string[]}
export interface FFKind{k:string;l:string;ph:string;h?:number;opts?:boolean;mask?:string}
export const FF_KINDS:FFKind[]=[
{k:'name',l:'Имя',ph:'Имя'},
{k:'tel',l:'Телефон',ph:'+7 (___) ___-__-__',mask:'+7 (___) ___-__-__'},
{k:'email',l:'Электронная почта',ph:'name@mail.ru'},
{k:'text',l:'Строка',ph:'Введите текст'},
{k:'area',l:'Несколько строк',ph:'Напиши сообщение',h:120},
{k:'select',l:'Выпадающий список',ph:'Выберите из списка',opts:true},
{k:'choice',l:'Вопрос с вариантами',ph:'Выберите вариант',opts:true,h:132},
{k:'check',l:'Галочка',ph:'Согласен с условиями'},
{k:'file',l:'Файл',ph:'Прикрепить файл'},
{k:'date',l:'Дата',ph:'ДД.ММ.ГГГГ'},
{k:'time',l:'Время',ph:'ЧЧ:ММ'},
{k:'num',l:'Количество',ph:'Количество'},
{k:'hidden',l:'Скрытое',ph:'Скрытое поле'}];
export const ffKind=(k?:string):FFKind|undefined=>FF_KINDS.find(x=>x.k===k);
export const ffLabel=(k?:string)=>ffKind(k)?.l??'Поле';
const OPTS=['Вариант 1','Вариант 2','Вариант 3'];
/** что менять у элемента, когда выбран вид поля: текст-подсказка, размер, настройки */
export const ffPatch=(k:string,old?:FF):Partial<El>=>{const d=ffKind(k);if(!d)return{};
const ff:FF={k,...(old?.nm?{nm:old.nm}:{}),...(old?.hint?{hint:old.hint}:{}),...(old?.req?{req:1 as const}:{}),...(old?.err?{err:old.err}:{}),...(d.mask?{mask:d.mask}:{}),...(d.opts?{opts:old?.opts?.length?old.opts:[...OPTS]}:{})};
return{ff,text:d.ph,...(d.h?{h:d.h}:{h:44})}};
export const maskSlots=(m:string)=>(m.match(/[_#9]/g)||[]).length;
const esc=(s:string)=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'} as Record<string,string>)[c]);
const SV=(p:string)=>`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none;color:#64748B">${p}</svg>`;
const CHEV=SV('<path d="m6 9 6 6 6-6"/>'),CAL=SV('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>'),CLOCK=SV('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),CLIP=SV('<path d="m21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/>');
const TYPE:Record<string,string>={email:'email',tel:'tel',num:'number',date:'date',time:'time'};
/** внутренняя разметка поля с настройками. live=true: настоящие поля ввода (просмотр и HTML), иначе рисунок для холста и PDF. Без `ff` возвращает '' */
export function ffHtml(e:El,live=false):string{
const f=e.ff;if(!f)return'';const k=f.k;const text=e.text??'';const star=f.req?' *':'';const o=f.opts??[];const def=f.def??'';
if(!live){
const t=esc(def&&k!=='check'&&k!=='choice'?def:text)+(f.req&&k!=='check'&&k!=='choice'?'<b style="color:#DC2626;font-weight:600"> *</b>':'');
if(k==='select')return`<span style="flex:1">${t}</span>${CHEV}`;
if(k==='date')return`<span style="flex:1">${t}</span>${CAL}`;
if(k==='time')return`<span style="flex:1">${t}</span>${CLOCK}`;
if(k==='file')return`${CLIP}<span style="margin-left:8px">${t}</span>`;
if(k==='area')return`<span style="align-self:flex-start;padding:12px 0">${t}</span>`;
if(k==='check')return`<span style="display:flex;align-items:center;gap:10px;color:#0F172A"><i class="ff-r sq${def==='1'?' on':''}"></i><span>${esc(text)}${f.req?'<b style="color:#DC2626;font-weight:600"> *</b>':''}</span></span>`;
if(k==='choice')return`<span class="ff-g"><b>${esc(text)}${f.req?'<b style="color:#DC2626"> *</b>':''}</b>${o.map(x=>`<span class="ff-o"><i class="ff-r rd${x===def?' on':''}"></i>${esc(x)}</span>`).join('')}</span>`;
if(k==='hidden')return`<span class="ff-hid">скрытое поле: ${esc(f.nm||'без названия')}${def?' = '+esc(def):''}</span>`;
return t}
const at=` data-k="${esc(k)}" data-nm="${esc(f.nm||'')}"${f.req?' data-req="1"':''}${f.mask?` data-mask="${esc(f.mask)}"`:''}${f.err?` data-err="${esc(f.err)}"`:''}`;
const hint=`<span class="ff-h" data-h="${esc(f.hint||'')}">${esc(f.hint||'')}</span>`;
const nmA=f.nm?` name="${esc(f.nm)}"`:'';const w=(x:string)=>`<span class="ff-w"${at}>${x}${hint}</span>`;
if(k==='hidden')return`<span class="ff-w"${at}><input type="hidden"${nmA} value="${esc(def)}"></span>`;
if(k==='area')return w(`<textarea class="ff-i"${nmA} placeholder="${esc(text+star)}">${esc(def)}</textarea>`);
if(k==='select')return w(`<select class="ff-i"${nmA}><option value=""${def?'':' selected'} disabled hidden>${esc(text+star)}</option>${o.map(x=>`<option${x===def?' selected':''}>${esc(x)}</option>`).join('')}</select><span class="ff-c">${CHEV}</span>`);
if(k==='choice')return w(`<span class="ff-g"><b>${esc(text+star)}</b>${o.map(x=>`<label class="ff-o"><input type="radio" name="r${esc(e.id)}" value="${esc(x)}"${x===def?' checked':''}>${esc(x)}</label>`).join('')}</span>`);
if(k==='check')return w(`<label class="ff-o"><input type="checkbox"${nmA}${def==='1'?' checked':''}>${esc(text+star)}</label>`);
if(k==='file')return w(`<label class="ff-f"><input type="file" hidden>${CLIP}<span data-t="${esc(text+star)}">${esc(text+star)}</span></label>`);
return w(`<input class="ff-i" type="${TYPE[k]||'text'}"${k==='tel'?' inputmode="tel" autocomplete="tel"':k==='name'?' autocomplete="name"':k==='email'?' autocomplete="email"':''}${nmA} placeholder="${esc(text+star)}" value="${esc(def)}">`)}
