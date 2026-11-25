import type {Project} from '../store';
/** письмо заказчику: без «Вы», без восклицаний */
export const LETTER_Q=['Подходит ли структура страниц и порядок блоков','Нужно ли что-то добавить или убрать','Тексты и призывы к действию: что поправить','Кто и до какого числа отвечает со стороны заказчика'];
const pl=(n:number,a:[string,string,string])=>{const m=n%100,k=n%10;return n+' '+(m>10&&m<15?a[2]:k===1?a[0]:k>1&&k<5?a[1]:a[2])};
export interface LetterIn{title:string;link:string;questions:string[];from:string}
export function buildLetter(p:Project,i:LetterIn):string{
const pages=p.sheets.filter(s=>s.kind==='page').length,pops=p.sheets.length-pages;
const bl=p.sheets.reduce((n,s)=>n+s.blocks.length,0);
const qs=i.questions.map(q=>q.trim()).filter(Boolean);
const L:string[]=[];
L.push('Тема: '+(i.title.trim()||p.name)+': прототип на согласование','');
L.push('Добрый день.','');
L.push('Прототип «'+(i.title.trim()||p.name)+'» готов: '+pl(pages,['страница','страницы','страниц'])+(pops?', '+pl(pops,['попап','попапа','попапов']):'')+', '+pl(bl,['блок','блока','блоков'])+'. Это чёрно-белая схема без дизайна: смотрим структуру, тексты и порядок.','');
L.push(i.link.trim()?'Открыть прототип: '+i.link.trim():'Прототип во вложении.','');
if(qs.length){L.push('Нужны ответы на вопросы:');qs.forEach((q,n)=>L.push((n+1)+'. '+q));L.push('')}
L.push('Правки удобнее присылать списком: страница, блок, что изменить.','');
L.push('Спасибо.');if(i.from.trim())L.push(i.from.trim());
return L.join('\n')}
