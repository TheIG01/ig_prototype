import type {El} from '../store';
/** Быстрые клавиши цвета и прозрачности. Возвращает правку для одного элемента или null. */
export function quickPatch(code:string,shift:boolean,alt:boolean,el:El):Partial<El>|null{
if(alt&&!shift&&code==='Slash')return{fill:'none'};
if(shift&&!alt&&code==='Slash')return{stroke:'none',sw:0};
if(shift&&!alt&&code==='KeyX'){
const f=el.fill,s=el.stroke;
if(!f&&!s)return null;
return{fill:s&&s!=='none'?s:undefined,stroke:f&&f!=='none'?f:undefined,sw:el.sw||1}}
if(!shift&&!alt){const m=/^Digit(\d)$/.exec(code);if(m){const n=+m[1];return{op:n===0?undefined:n/10}}}
return null}
