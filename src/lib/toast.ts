import {create} from 'zustand';
export interface Toast{id:number;text:string;act?:{label:string;run:()=>void}}
let n=0;let tm:ReturnType<typeof setTimeout>;
export const useToast=create<{t:Toast|null}>()(()=>({t:null}));
export const toast=(text:string,act?:Toast['act'],ms=4000)=>{const id=++n;useToast.setState({t:{id,text,act}});clearTimeout(tm);tm=setTimeout(()=>{if(useToast.getState().t?.id===id)useToast.setState({t:null})},ms)};
export const dismiss=()=>useToast.setState({t:null});
