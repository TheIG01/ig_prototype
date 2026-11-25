/** подсказки при наведении: заменяют медленные системные title; название и клавиша отдельно */
let el:HTMLDivElement|null=null;let tm=0;let cur:Element|null=null;
const hide=()=>{clearTimeout(tm);cur=null;el?.classList.remove('on')};
const show=(t:Element,tx:string)=>{if(!el||!t.isConnected)return;const m=/^(.*?)\s*\(([^()]{1,24})\)$/.exec(tx);el.textContent='';const a=document.createElement('span');a.textContent=m?m[1]:tx;el.appendChild(a);
if(m){const k=document.createElement('kbd');k.textContent=m[2];el.appendChild(k)}
el.classList.add('on');const r=t.getBoundingClientRect(),w=el.offsetWidth,h=el.offsetHeight;
let x=r.left+r.width/2-w/2,y=r.bottom+8;if(t.closest('.rail')){x=r.right+10;y=r.top+r.height/2-h/2}else if(t.closest('.tools')){y=r.top-h-10}
el.style.left=Math.max(8,Math.min(innerWidth-w-8,x))+'px';el.style.top=Math.max(8,Math.min(innerHeight-h-8,y))+'px'};
export function initTips(){if(el||typeof document==='undefined')return;
el=document.createElement('div');el.className='tip';el.setAttribute('role','tooltip');document.body.appendChild(el);
document.addEventListener('mouseover',e=>{const t=(e.target as Element).closest?.('[title],[data-tip]');if(!t||t===cur)return;
const ti=t.getAttribute('title');if(ti){t.setAttribute('data-tip',ti);if(!t.getAttribute('aria-label'))t.setAttribute('aria-label',ti);t.removeAttribute('title')}
const tx=t.getAttribute('data-tip');if(!tx)return;hide();cur=t;tm=window.setTimeout(()=>show(t,tx),240)});
document.addEventListener('mouseout',e=>{if(cur&&!cur.contains(e.relatedTarget as Node|null))hide()});
document.addEventListener('pointerdown',hide,true);document.addEventListener('scroll',hide,true);addEventListener('blur',hide)}
