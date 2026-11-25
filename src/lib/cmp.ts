import type {El} from '../store';
/** Компонент для просмотра (тип `cmp`): k вид, items пункты (по строке), v число, on включён. Пункт со знаком «+» в начале отмечен или раскрыт */
export interface CP{k:string;items?:string[];v?:number;on?:1}
export interface CmpKind{k:string;l:string;w:number;h:number;text:string;items?:string[];v?:number;on?:1;hint?:string}
export const CMP_KINDS:CmpKind[]=[
{k:'radio',l:'Радиокнопки',w:280,h:130,text:'Способ связи',items:['+Телефон','Мессенджер','Почта'],hint:'Один пункт на строку. Знак «+» в начале: выбран сразу'},
{k:'check',l:'Чекбоксы',w:280,h:130,text:'Что нужно',items:['+Замер','Доставка','Монтаж'],hint:'Один пункт на строку. Знак «+» в начале: отмечен сразу'},
{k:'switch',l:'Переключатель',w:300,h:32,text:'Присылать напоминания',on:1},
{k:'slider',l:'Ползунок',w:280,h:60,text:'Бюджет',v:50},
{k:'progress',l:'Прогресс',w:280,h:44,text:'Готово',v:60},
{k:'rating',l:'Рейтинг',w:220,h:56,text:'Оценка',v:4},
{k:'tooltip',l:'Подсказка',w:240,h:90,text:'Что это?',items:['Короткое пояснение появляется при наведении или нажатии'],hint:'Первая строка: текст подсказки'},
{k:'table',l:'Таблица',w:440,h:170,text:'',items:['Тариф | Цена | Срок','Старт | 10 000 ₽ | 5 дней','Бизнес | 25 000 ₽ | 10 дней','Максимум | 60 000 ₽ | 20 дней'],hint:'Одна строка таблицы на строку, ячейки через «|». Первая строка: заголовок'},
{k:'accordion',l:'Аккордеон',w:440,h:210,text:'',items:['+Сколько это стоит | Цена зависит от площади и материалов','Как быстро начнёте | В течение трёх дней после договора','Есть ли гарантия | Да, на все работы три года'],hint:'Пункт: «Заголовок | Текст». Знак «+» в начале: раскрыт сразу'},
{k:'tabs',l:'Табы',w:440,h:170,text:'',items:['Описание | Текст первой вкладки','Состав | Текст второй вкладки','Отзывы | Текст третьей вкладки'],hint:'Вкладка: «Название | Текст»'}];
export const cmpKind=(k?:string)=>CMP_KINDS.find(x=>x.k===k);
export const cmpLabel=(k?:string)=>cmpKind(k)?.l??'Компонент';
export const cmpPatch=(k:string):Partial<El>=>{const d=cmpKind(k);if(!d)return{};return{cp:{k,...(d.items?{items:[...d.items]}:{}),...(d.v!==undefined?{v:d.v}:{}),...(d.on?{on:1 as const}:{})},text:d.text,w:d.w,h:d.h}};
const esc=(s:string)=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'} as Record<string,string>)[c]);
const mark=(s:string)=>s[0]==='+'?{on:true,t:s.slice(1).trim()}:{on:false,t:s};
const pair=(s:string)=>{const i=s.indexOf('|');return i<0?{h:s.trim(),b:''}:{h:s.slice(0,i).trim(),b:s.slice(i+1).trim()}};
/** разметка компонента; интерактив включает просмотр по классам и атрибутам data-cp */
export function cmpHtml(e:El):string{const c=e.cp;if(!c)return'';const k=c.k;const it=c.items??[];const tx=esc(e.text??'');const v=Math.max(0,Math.min(100,Math.round(c.v??50)));
const lab=tx?`<div class="cp-l">${tx}</div>`:'';const root=(x:string)=>`<div class="cp cp-${k}" data-cp="${k}">${x}</div>`;
if(k==='radio'||k==='check'){let seen=false;return root(lab+it.map(r=>{const m=mark(r);const on=m.on&&(k==='check'||!seen);if(on)seen=true;return`<div class="cp-o${on?' on':''}"><i></i><span>${esc(m.t)}</span></div>`}).join(''))}
if(k==='switch')return root(`<div class="cp-sw${c.on?' on':''}"><i></i></div><span>${tx}</span>`);
if(k==='slider')return root(`<div class="cp-h"><span>${tx}</span><b>${v}</b></div><input class="cp-rg" type="range" min="0" max="100" value="${v}">`);
if(k==='progress')return root(`<div class="cp-h"><span>${tx}</span><b>${v}%</b></div><div class="cp-bar"><i style="width:${v}%"></i></div>`);
if(k==='rating'){const n=Math.max(0,Math.min(5,Math.round(c.v??0)));return root(lab+`<div class="cp-st">${[1,2,3,4,5].map(i=>`<span class="cp-s${i<=n?' on':''}" data-i="${i}">★</span>`).join('')}</div>`)}
if(k==='tooltip')return root(`<span class="cp-tr">${tx}<i>?</i></span><div class="cp-tip">${esc(it[0]??'')}</div>`);
if(k==='table'){const rows=it.map(r=>r.split('|').map(x=>esc(x.trim())));if(!rows.length)return root(lab);const [hd,...bd]=rows;return root(lab+`<table class="cp-t"><thead><tr>${hd.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${bd.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`)}
if(k==='accordion')return root(lab+it.map(r=>{const m=mark(r);const p=pair(m.t);return`<div class="cp-a${m.on?' open':''}"><div class="cp-ah"><span>${esc(p.h)}</span><i></i></div><div class="cp-ab">${esc(p.b)}</div></div>`}).join(''));
if(k==='tabs'){const ps=it.map(pair);return root(lab+`<div class="cp-tbs">${ps.map((p,i)=>`<span class="cp-tb${i?'':' on'}" data-i="${i}">${esc(p.h)}</span>`).join('')}</div>`+ps.map((p,i)=>`<div class="cp-tp${i?'':' on'}" data-i="${i}">${esc(p.b)}</div>`).join(''))}
return root(lab)}
