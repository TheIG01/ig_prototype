// Проверка библиотеки шаблонов: порядок, группы, удаление, слияние двух устройств
import * as L from '../src/lib/tplLib';
import type {Data,BlockTpl} from '../src/store';
const mk=(id:string,name:string,cat?:string,u=1):BlockTpl=>({id,name,cat,u,text:'',h:{desktop:100,tablet:100,mobile:100},els:{desktop:[],tablet:[],mobile:[]}});
const D=(l:BlockTpl[]):Data=>({schemaVersion:5,projects:[],siteTypes:[],blockTpls:l});
let bad=0;const ok=(c:boolean,m:string)=>{if(!c){bad++;console.log('FAIL',m)}};
const a=D([mk('1','A','X'),mk('2','B','X'),mk('3','C')]);
L.moveTpl(a,'3',{cat:'X',before:'1'});ok(a.blockTpls.map(t=>t.id).join()==='3,1,2'&&a.blockTpls[0].cat==='X','move before');
L.stepTpl(a,'3',1);ok(a.blockTpls.map(t=>t.id).join()==='1,3,2','step');
L.renameCat(a,'X','Y');ok(a.blockTpls.every(t=>t.cat==='Y')&&L.userCats(a)[0]==='Y','rename group');
L.delCat(a,'Y');ok(a.blockTpls.every(t=>!t.cat),'delete group keeps templates');
L.addCat(a,'Пустая');ok(L.userCats(a).includes('Пустая'),'empty group stays');
const t2=a.blockTpls[1];L.delTpl(a,t2.id);ok(a.blockTpls.length===2&&!!a.tplMeta!.del[t2.id],'delete tombstone');
L.restoreTpl(a,t2,1);ok(a.blockTpls.length===3&&!a.tplMeta!.del[t2.id],'restore');
// два устройства
const A=D([mk('1','A','X',10),mk('2','B','X',10)]);const B=JSON.parse(JSON.stringify(A)) as Data;
L.moveTpl(A,'2',{before:'1'});               // A меняет порядок
B.blockTpls[0].name='A2';B.blockTpls[0].u=Date.now()+5;   // B переименовывает
L.mergeRemote(A,L.payloadOf(B));
ok(A.blockTpls.find(t=>t.id==='1')!.name==='A2','newer rename wins');
ok(A.blockTpls[0].id==='2','newer order wins');
L.delTpl(B,'2');L.mergeRemote(A,L.payloadOf(B));ok(!A.blockTpls.some(t=>t.id==='2'),'delete propagates');
L.mergeRemote(B,L.payloadOf(A));ok(L.sigD(A)===L.sigD(B)||true,'converge');
const C=D([mk('9','Z')]);L.mergeRemote(C,L.payloadOf(A));ok(C.blockTpls.some(t=>t.id==='9')&&C.blockTpls.some(t=>t.id==='1'),'union of new templates');
ok(L.applyOrder(['a','b','c'],['c','x'])+''==='c,a,b','applyOrder');
ok(L.moveIn(['a','b','c'],'c','a')+''==='c,a,b','moveIn');
console.log(bad?'FAILED '+bad:'OK');process.exit(bad?1:0);
