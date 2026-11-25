import {toast} from './toast';
/** плашка «Есть обновление»: новый сервис-воркер взял управление, а страница ещё на старой версии */
export function watchUpdate():void{
if(!('serviceWorker' in navigator))return;
let had=!!navigator.serviceWorker.controller;
navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!had){had=true;return}
toast('Вышла новая версия. Обнови страницу, данные сохранены',{label:'Обновить',run:()=>location.reload()},60000)})}
