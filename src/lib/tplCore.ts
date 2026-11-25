// Маленький файл без шаблонов: нужен store и migrate, чтобы не тянуть весь tpl*.ts.
import {uid} from './uid';
import type {Dev} from './dev';
import type {El} from '../store';
import type {Built} from './tpl';
export const emptyBuild=():Built=>({h:{desktop:400,tablet:400,mobile:480},els:{desktop:[],tablet:[],mobile:[]}});
export const fresh=(e:Record<Dev,El[]>):Record<Dev,El[]>=>({desktop:e.desktop.map(x=>({...x,id:uid()})),tablet:e.tablet.map(x=>({...x,id:uid()})),mobile:e.mobile.map(x=>({...x,id:uid()}))});
