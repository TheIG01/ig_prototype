import type {El} from '../store';
/** Новые визуальные поля `El` (1.50): поворот, отражение, радиусы по углам, пунктир, положение обводки, тень, размытие. Возвращает CSS (kebab-case). */
const BOX=new Set(['btn','rect','input','img']);
export const rotOf=(e:El)=>e.rot??0;
export function fxMap(e:El):Record<string,string>{
const o:Record<string,string>={};
const tr:string[]=[];if(e.rot)tr.push(`rotate(${e.rot}deg)`);if(e.flipX)tr.push('scaleX(-1)');if(e.flipY)tr.push('scaleY(-1)');
if(tr.length)o['transform']=tr.join(' ');
const box=BOX.has(e.t);const f:string[]=[];const sh:string[]=[];
if(box&&e.rc)o['border-radius']=e.rc.map(v=>Math.max(0,v)+'px').join(' ');
const sw=e.sw??1.5;const col=e.stroke==='none'?'transparent':e.stroke??'#1E293B';
if(box&&e.dash&&e.dash!=='solid'&&sw>0){o['border-style']=e.dash;o['border-width']=sw+'px';if(e.stroke)o['border-color']=col}
else if(box&&(e.sp==='out'||e.sp==='mid')&&sw>0){o['border-style']='none';o['border-width']='0';
sh.push(e.sp==='out'?`0 0 0 ${sw}px ${col}`:`0 0 0 ${sw/2}px ${col}`,...(e.sp==='mid'?[`inset 0 0 0 ${sw/2}px ${col}`]:[]))}
if(e.shadow){const s=e.shadow;if(box)sh.push(`${s.x}px ${s.y}px ${s.b}px ${s.c}`);else f.push(`drop-shadow(${s.x}px ${s.y}px ${s.b}px ${s.c})`)}
if(e.blur)f.push(`blur(${e.blur}px)`);
if(sh.length)o['box-shadow']=sh.join(', ');if(f.length)o['filter']=f.join(' ');
return o}
/** Угол в 0..359 без дробей */
export const normRot=(v:number)=>{const r=((Math.round(v)%360)+360)%360;return r};
