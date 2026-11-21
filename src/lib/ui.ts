/** настройки вида сервиса: хранятся в localStorage (igp.ui), применяются к <html> */
export type Ui={accent:string;density:'cozy'|'compact';motion:'on'|'off';labels:1|1.25|1.5;grid:boolean};
export const UI0:Ui={accent:'#2F6BFF',density:'cozy',motion:'on',labels:1,grid:true};
export const ACCENTS:[string,string][]=[['#2F6BFF','Синий'],['#5B4BFF','Индиго'],['#0E9F9A','Бирюзовый'],['#16A34A','Зелёный'],['#F97316','Оранжевый'],['#E11D48','Малиновый']];
const K='igp.ui';
const clean=(o:Partial<Ui>):Ui=>({accent:/^#[0-9a-f]{6}$/i.test(o.accent??'')?o.accent!:UI0.accent,density:o.density==='compact'?'compact':'cozy',motion:o.motion==='off'?'off':'on',labels:o.labels===1.25||o.labels===1.5?o.labels:1,grid:o.grid!==false});
export const loadUi=():Ui=>{try{return clean(JSON.parse(localStorage.getItem(K)||'{}'))}catch{return UI0}};
export const applyUi=(u:Ui)=>{const r=document.documentElement;r.style.setProperty('--acc',u.accent);r.style.setProperty('--ls',String(u.labels));r.dataset.density=u.density;r.dataset.motion=u.motion;r.dataset.grid=u.grid?'on':'off';document.querySelector('meta[name=theme-color]')?.setAttribute('content',u.accent)};
export const saveUi=(p:Partial<Ui>):Ui=>{const u=clean({...loadUi(),...p});try{localStorage.setItem(K,JSON.stringify(u))}catch{/* хранилище недоступно */}applyUi(u);return u};
