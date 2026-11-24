import {create} from 'zustand';
/** Переименование слоя (Ctrl+R): id элемента, чьё имя сейчас правится в «Слоях» */
export const useLayerUi=create<{renId:string|null;setRen:(id:string|null)=>void}>(set=>({renId:null,setRen:id=>set({renId:id})}));
