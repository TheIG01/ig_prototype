export type Dev='desktop'|'tablet'|'mobile';
export const FW:Record<Dev,number>={desktop:1440,tablet:768,mobile:390};
export const DEVS:Dev[]=['desktop','tablet','mobile'];
/** блок есть на устройстве: нет поля dv значит на всех трёх */
export const onDev=(b:{dv?:Dev[]},d:Dev)=>!b.dv||b.dv.includes(d);
export const DEVN:Record<Dev,string>={desktop:'ПК',tablet:'Планшет',mobile:'Мобилка'};
export const DEVS_SHORT:Record<Dev,string>={desktop:'ПК',tablet:'План.',mobile:'Моб.'};
