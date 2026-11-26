// Единая точка подключения новых групп блоков из конвейера «скриншоты → блоки» (docs/prompts/BLOCKS.md).
// Новая группа = новый файл tplИмя.ts с экспортом ИМЯ и ИМЯ_TIPS. Здесь только добавить импорт и две строки ниже.
// tpl.ts и store.ts для этого трогать не нужно.
import type {Dev} from './dev';
import type {Out} from './tplFirst';

export interface ExtraTpl{name:string;cat:string;spec:(d:Dev)=>Out}
export const EXTRA:ExtraTpl[]=[];
export const EXTRA_TIPS:Record<string,string[]>={};
