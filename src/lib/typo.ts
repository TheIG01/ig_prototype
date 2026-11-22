/** Типограф RU/EN. Чистая функция: текст в проекте не меняется, правила применяются при показе (просмотр, HTML, PDF).
 *  Не трогает теги, ссылки, email, телефоны и код в `обратных кавычках`. Язык строки определяется по буквам. */
export type TyKey='ruQuotes'|'ruShort'|'ruUnits'|'ruInit'|'ruAbbr'|'ruDash'|'enQuotes'|'enUnits'|'enDash'|'ellipsis'|'spaces'|'ranges';
export type Ty={on:boolean}&Record<TyKey,boolean>;
export const TY_RULES:{k:TyKey;l:string;d:string}[]=[
{k:'ruQuotes',l:'RU: «ёлочки»',d:'"слово" → «слово», внутри кавычек „лапки“'},
{k:'ruShort',l:'RU: предлоги и короткие слова',d:'в, на, у, с, к, о, а, но, я и другие не остаются в конце строки'},
{k:'ruUnits',l:'RU: число и единица',d:'10 мин, 5 %, 2024 г., 50 000 ₽ не разрываются'},
{k:'ruInit',l:'RU: инициалы и фамилия',d:'И. И. Иванов, г. Москва не разрываются'},
{k:'ruAbbr',l:'RU: сокращения',d:'и т. д., и др., № 5, ул. Мира, стр. 3'},
{k:'ruDash',l:'RU: тире',d:'« - » → « — », неразрывный пробел перед тире'},
{k:'enQuotes',l:'EN: “кавычки” и апостроф',d:'"word" → “word”, don\'t → don’t'},
{k:'enUnits',l:'EN: число и единица',d:'10 min, 5 %, 20 kg не разрываются'},
{k:'enDash',l:'EN: тире',d:'« - » → «—» без пробелов'},
{k:'ellipsis',l:'Многоточие',d:'... → …'},
{k:'spaces',l:'Пробелы',d:'двойные пробелы, пробел перед запятой, пробел после запятой'},
{k:'ranges',l:'Диапазоны чисел',d:'10-20 → 10–20'}];
export const TY0:Ty={on:true,ruQuotes:true,ruShort:true,ruUnits:true,ruInit:true,ruAbbr:true,ruDash:true,enQuotes:true,enUnits:true,enDash:true,ellipsis:true,spaces:true,ranges:true};
export const TY_DEMO='Мы делаем сайты "под ключ" - за 10 дней, от 50 000 ₽ (с гарантией 100 %). И т.д. Пишет А.С. Пушкин, г. Москва, ул. Мира, д. 5...\nWe build "fast" sites - in 10 days for 20 % less; don\'t wait. Call +7 (900) 123-45-67 or mail a.b@site.ru, <b class="x">пример 1-2</b>.';
export const cleanTy=(o:unknown):Ty=>{const r=(o&&typeof o==='object'?o:{}) as Record<string,unknown>,t={...TY0};for(const k of Object.keys(t) as (keyof Ty)[])if(typeof r[k]==='boolean')t[k]=r[k] as boolean;return t};
const NB='\u00A0',CY='А-Яа-яЁё',PROT=new RegExp('<\\/?[a-zA-Z][^>]*>|`[^`]*`|https?:\\/\\/[^\\s<>«»"]+|www\\.[^\\s<>«»"]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)+|\\+\\d[\\d\\s().-]{7,}\\d|\\b8[\\s-]?\\(?\\d{3}\\)?[\\s-]?\\d{3}[\\s-]?\\d{2}[\\s-]?\\d{2}\\b','g');
const SHORT=new RegExp('(?<![A-Za-z0-9\\-'+CY+'])(в|во|и|к|ко|на|с|со|у|о|об|а|но|я|за|из|от|по|до|не|ни)[ ]+(?=\\S)','gi');
const RU_UNITS='%|‰|₽|€|\\$|°C|°|руб[а-яё]*\\.?|коп\\.?|тыс\\.?|млн|млрд|шт\\.?|чел\\.?|мин[а-яё]*\\.?|сек[а-яё]*\\.?|мес[а-яё]*\\.?|нед[а-яё]*\\.?|дн[а-яё]*\\.?|лет|год[а-яё]*|час[а-яё]*|ч|г\\.|гг\\.|р\\.|кг|мг|мл|см|мм|км|м²|м³|м|л|г|Гб|ГБ|Мб|МБ|Кб|КБ|ГГц|Гц|кВт|Вт|px';
const EN_UNITS='%|‰|°C|°F|°|kg|mg|ml|cm|mm|km|min[a-z]*|sec[a-z]*|hr?s?|hours?|days?|weeks?|months?|years?|pcs|px|pt|GB|MB|KB|USD|EUR|[mgl]';
const unitRe=(u:string)=>new RegExp('(\\d)[ ]+(?=(?:'+u+')(?![A-Za-z0-9'+CY+']))','gi');
const RU_U=unitRe(RU_UNITS),EN_U=unitRe(EN_UNITS);
const lang=(s:string):'ru'|'en'=>{const c=(s.match(/[А-Яа-яЁё]/g)||[]).length,l=(s.match(/[A-Za-z]/g)||[]).length;return c>=l?'ru':'en'};
/** все виды кавычек считаем кавычками и расставляем по позиции и глубине: ru «…„…“…», en “…‘…’…” */
function quotes(s:string,ru:boolean):string{let d=0;const O=ru?['«','„']:['“','‘'],C=ru?['»','“']:['”','’'];
return s.replace(/["“”„«»]/g,(q,i:number,str:string)=>{const p=i?str[i-1]:' ';const open=q==='«'?true:q==='»'?false:/[\s(\[{—–\-\/„“«\u00A0]/.test(p)||(d===0&&q!=='”'&&q!=='»'&&!/[\p{L}\p{N}.,!?…:;)\]%]/u.test(p));
if(open){d++;return O[Math.min(d,2)-1]}const r=C[Math.min(Math.max(d,1),2)-1];if(d>0)d--;return r})}
const apos=(s:string)=>s.replace(/'/g,(_m,i:number,str:string)=>{const p=i?str[i-1]:' ';return /[\s(\[{“—]/.test(p)?'‘':'’'});
const dash=(s:string,out:(a:string)=>string)=>s.replace(/(?<=\S)[ \u00A0]+(--|-|–|—)[ \u00A0]+(?=\S)/g,(m:string,_d:string,i:number,str:string)=>{const a=str[i-1],e=str[i+m.length];return /\d/.test(a)&&/\d/.test(e)?m:out(m)});
/** применить правила; язык определяется для каждой строки отдельно, переводы строк сохраняются */
export const typo=(s:string,o:Ty=TY0):string=>!o.on||!s?s:s.includes('\n')?s.split('\n').map(l=>line(l,o)).join('\n'):line(s,o);
function line(s:string,o:Ty):string{
const keep:string[]=[];
let t=s.replace(PROT,m=>{keep.push(m);return'\uE000'+(keep.length-1)+'\uE001'});const ru=lang(t)==='ru';
if(o.spaces){t=t.replace(/[ ]{2,}/g,' ').replace(/[ ]+(?=[,;:!?])/g,'').replace(/,(?=[A-Za-z]|[А-Яа-яЁё])/g,', ').replace(/[ ]+(?=\n|$)/g,'')}
if(o.ellipsis)t=t.replace(/\.{3,}/g,'…');
if(o.ranges)t=t.replace(new RegExp('(?<![\\w'+CY+'.\\-–/:])(\\d{1,6})-(\\d{1,6})(?![\\w'+CY+'.\\-–/:])','g'),'$1–$2');
if(ru){
if(o.ruDash)t=dash(t,()=>NB+'— ');
if(o.ruQuotes)t=quotes(t,true);
if(o.ruAbbr){t=t.replace(new RegExp('(?<![A-Za-z'+CY+'])(т)\\.[ ]?([дпек])\\.','gi'),'$1.'+NB+'$2.').replace(new RegExp('[ ]+(?=(?:т\\.'+NB+'[дпек]|др|проч)\\.)','gi'),NB)
.replace(/([№§])[ ]+(?=\S)/g,'$1'+NB).replace(new RegExp('(?<![A-Za-z'+CY+'])(ул|д|кв|стр|рис|см|корп|обл|оф|тел|пер|пр-т|просп|наб|им)\\.[ ]+(?=[A-Za-z0-9'+CY+'])','g'),'$1.'+NB)}
if(o.ruShort)t=t.replace(SHORT,'$1'+NB);
if(o.ruUnits)t=t.replace(/(\d)[ ]+(?=\d{3}(?!\d))/g,'$1'+NB).replace(RU_U,'$1'+NB);
if(o.ruInit)t=t.replace(new RegExp('([А-ЯЁ]\\.)[ ]+(?=[А-ЯЁ])','g'),'$1'+NB).replace(new RegExp('(?<=[а-яё])[ ]+(?=[А-ЯЁ]\\.[ '+NB+']?[А-ЯЁ]\\.)','g'),NB).replace(new RegExp('(?<![A-Za-z'+CY+'])(г)\\.[ ]+(?=[А-ЯЁ])','g'),'$1.'+NB)
}else{
if(o.enDash)t=dash(t,()=>'—');
if(o.enQuotes)t=apos(quotes(t,false));
if(o.enUnits)t=t.replace(EN_U,'$1'+NB)}
return t.replace(/\uE000(\d+)\uE001/g,(_m,i:string)=>keep[+i])}
