import type {El,Block} from '../store';
import {ffLabel} from './ff';import {cmpLabel} from './cmp';
/** описание полей формы, компонентов и настроек формы для ТЗ (Markdown и JSON) */
export const ffNote=(e:El):string=>{const f=e.ff;if(!f)return'';
return` · поле формы: ${ffLabel(f.k).toLowerCase()}${f.nm?`, название «${f.nm}»`:''}${f.hint?`, подсказка «${f.hint}»`:''}${f.def?`, значение по умолчанию «${f.def}»`:''}${f.req?', ОБЯЗАТЕЛЬНОЕ':', необязательное'}${f.mask?`, маска «${f.mask}»`:''}${f.err?`, сообщение об ошибке «${f.err}»`:''}${f.opts?.length?`, варианты: ${f.opts.join(' / ')}`:''}`};
const items=(c:{items?:string[]}):string=>(c.items??[]).map(x=>x.replace(/^\+/,'').trim()).join(' / ');
const HOW:Record<string,string>={radio:'можно выбрать один пункт',check:'можно отметить несколько пунктов',switch:'переключается кликом (вкл и выкл)',slider:'двигается ползунок от 0 до 100',progress:'полоса прогресса, не нажимается',rating:'рейтинг в звёздах от 1 до 5, ставится кликом',tooltip:'подсказка появляется при наведении, на телефоне по нажатию',table:'обычная таблица, первая строка заголовок',accordion:'пункты раскрываются и сворачиваются по клику',tabs:'вкладки переключаются по клику (табы: расположение, вид и выравнивание заданы в настройках)'};
export const cpNote=(e:El):string=>{const c=e.cp;if(!c)return'';
return` · интерактивный компонент: ${cmpLabel(c.k).toLowerCase()} (${HOW[c.k]??''})${c.items?.length?`, пункты: ${items(c)}`:''}${c.v!==undefined&&(c.k==='slider'||c.k==='progress'||c.k==='rating')?`, значение ${c.v}${c.k==='progress'?'%':''}`:''}${c.on?', включён сразу':''}`};
export const ffJson=(e:El)=>e.ff?{formField:{kind:e.ff.k,...(e.ff.nm?{name:e.ff.nm}:{}),...(e.ff.hint?{hint:e.ff.hint}:{}),...(e.ff.def?{default:e.ff.def}:{}),required:!!e.ff.req,...(e.ff.mask?{mask:e.ff.mask}:{}),...(e.ff.err?{errorMessage:e.ff.err}:{}),...(e.ff.opts?.length?{options:e.ff.opts}:{})}}:{};
export const cpJson=(e:El)=>e.cp?{component:{kind:e.cp.k,...(e.cp.items?.length?{items:e.cp.items.map(x=>x.replace(/^\+/,'').trim())}:{}),...(e.cp.v!==undefined?{value:e.cp.v}:{}),...(e.cp.on?{on:true}:{})}}:{};
const hasForm=(b:Block)=>(['desktop','tablet','mobile'] as const).some(d=>b.els[d].some(e=>e.t==='input'&&e.ff));
/** настройки формы блока (куда отправлять, согласие, «Спасибо») и список обязательных полей */
export const formMd=(b:Block):string=>{const f=b.fm;if(!f&&!hasForm(b))return'';if(!f||!(f.to||f.consent||f.thanks))return'';
const req=[...new Set(b.els.desktop.filter(e=>e.t==='input'&&e.ff?.req).map(e=>e.ff?.nm||e.text))];
return`#### Форма\n${f.to?.trim()?`- Куда отправлять: ${f.to.trim()}\n`:''}${f.consent?.trim()?`- Согласие: ${f.consent.trim()}\n`:''}${f.thanks?.trim()?`- После отправки показать: «${f.thanks.trim()}»\n`:''}${req.length?`- Обязательные поля: ${req.join(', ')}\n`:''}\n`};
export const fmJson=(b:Block)=>b.fm&&(b.fm.to||b.fm.consent||b.fm.thanks)?{form:{...(b.fm.to?{sendTo:b.fm.to}:{}),...(b.fm.consent?{consent:b.fm.consent}:{}),...(b.fm.thanks?{thanks:b.fm.thanks}:{})}}:{};
