/** Расчёт размера при перетаскивании ручки: Shift = пропорции, Alt = от центра. */
export interface Box{x:number;y:number;w:number;h:number}
export interface RsOpt{shift:boolean;alt:boolean;line:boolean;W:number;sx:(v:number)=>number;sy:(v:number)=>number}
const MIN=16;
export function calcResize(d:Box,dir:string,dx:number,dy:number,o:RsOpt):Box{
const e=dir.includes('e'),w=dir.includes('w'),n=dir.includes('n'),s=dir.includes('s');
let L=d.x,R=d.x+d.w,T=d.y,B=d.y+d.h;
if(e)R=o.sx(R+dx);if(w)L=o.sx(L+dx);
if(!o.line){if(s)B=o.sy(B+dy);if(n)T=o.sy(T+dy)}
if(o.alt){// противоположный край зеркалит движение: центр остаётся на месте
const cx=d.x+d.w/2,cy=d.y+d.h/2;
if(e)L=2*cx-R;if(w)R=2*cx-L;
if(!o.line){if(s)T=2*cy-B;if(n)B=2*cy-T}}
if(R-L<MIN){if(o.alt){const c=(L+R)/2;L=c-MIN/2;R=c+MIN/2}else if(w)L=R-MIN;else R=L+MIN}
if(!o.line&&B-T<MIN){if(o.alt){const c=(T+B)/2;T=c-MIN/2;B=c+MIN/2}else if(n)T=B-MIN;else B=T+MIN}
if(o.shift&&!o.line&&d.h>0&&d.w>0){
const k=d.w/d.h,corner=(e||w)&&(n||s);
let nw=R-L,nh=B-T;
if(corner){const f=Math.max(nw/d.w,nh/d.h);nw=Math.max(MIN,d.w*f);nh=nw/k;
if(w)L=R-nw;else R=L+nw;if(n)T=B-nh;else B=T+nh;
if(o.alt){const cx=d.x+d.w/2,cy=d.y+d.h/2;L=cx-nw/2;R=cx+nw/2;T=cy-nh/2;B=cy+nh/2}}
else if(e||w){nh=Math.max(MIN,nw/k);const cy=d.y+d.h/2;T=cy-nh/2;B=cy+nh/2}
else{nw=Math.max(MIN,nh*k);const cx=d.x+d.w/2;L=cx-nw/2;R=cx+nw/2}}
let nx=Math.round(L),nw2=Math.round(R-L),ny=Math.round(T),nh2=o.line?0:Math.round(B-T);
if(nx<0){if(o.shift)nx=0;else{nw2+=nx;nx=0}}
if(nx+nw2>o.W){if(o.shift)nx=Math.max(0,o.W-nw2);else nw2=o.W-nx}
if(ny<0)ny=0;
return{x:nx,y:ny,w:Math.max(MIN,nw2),h:nh2}}
