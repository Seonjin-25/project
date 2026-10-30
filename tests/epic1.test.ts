import { describe,it,expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { FIELDS,MONTHS,parseCSV,parseFile,type SiteRecord } from '../src/lib/data';
import { DEFAULT_FILTERS,changeFilters,difference,format,previousMonth,sitesFor,summary,trend } from '../src/lib/domain';
import { INITIAL_STATE,reducer } from '../src/state/model';
const read=(name:string)=>readFileSync(new URL(`../data/${name}`,import.meta.url),'utf8');
const csv=read('현장공정기성.csv');
const json=read('현장공정기성.json');
const normal=parseFile('normal.csv',csv);
const rows=normal.records;
const filters={...DEFAULT_FILTERS};
function asCSV(records:Record<string,unknown>[]){return [FIELDS.join(','),...records.map(r=>FIELDS.map(f=>`"${String(r[f]??'').replaceAll('"','""')}"`).join(','))].join('\r\n');}
function modified(patch:Partial<SiteRecord>){return parseFile('copy.csv',asCSV([{...rows[0],...patch}]));}
describe('파일 검사',()=>{
 it('정상 CSV 144행·15열·12개월·12개 현장',()=>{expect(normal.errors).toEqual([]);expect(normal.warnings).toEqual([]);expect(rows).toHaveLength(144);expect(Object.keys(rows[0])).toHaveLength(15);expect(new Set(rows.map(r=>r.month)).size).toBe(12);expect(new Set(rows.map(r=>r.siteId)).size).toBe(12);});
 it('CSV와 JSON 원본 값 동일',()=>{const other=parseFile('normal.json',json);expect(other.errors).toEqual([]);expect(other.records).toEqual(rows);});
 it.each(['오류_중복키.csv','오류_공정률101.csv','오류_공정률빈값.csv'])('%s 오류 거부',name=>{const c=parseFile(name,read(`검증용_오류데이터/${name}`));expect(c.errors.length).toBeGreaterThan(0);expect(c.errors.some(e=>e.row===(name.includes('중복')?146:134))).toBe(true);});
 it('빈 공정률은 0으로 바꾸지 않음',()=>{const c=parseFile('bad.csv',read('검증용_오류데이터/오류_공정률빈값.csv'));expect(c.errors.some(e=>e.field==='actualProgress'&&e.message.includes('비어'))).toBe(true);});
 it('따옴표·쉼표·여러 줄·겹따옴표 기록 보존',()=>{const text='특이사항,내용\r\n"자재, 납기","첫 줄\n둘째 줄 ""확인"""\r\n';expect(parseCSV(text)[1].cells).toEqual(['자재, 납기','첫 줄\n둘째 줄 "확인"']);});
 it('기록 원문은 공백까지 보존',()=>{const r=modified({issueSummary:'  상황, "확인"\n다음 줄  '});expect(r.records[0].issueSummary).toBe('  상황, "확인"\n다음 줄  ');});
 it.each(['a,b\n"미완성','a,b\n"값"잘못,1'])('잘못된 따옴표 거부',source=>expect(()=>parseCSV(source)).toThrow());
 it('열 누락·중복 헤더·열 개수 불일치 거부',()=>{expect(parseFile('x.csv','month,siteId\n2026-09,A').errors.length).toBeGreaterThan(0);expect(parseFile('x.csv',csv.replace('month,siteId','month,month')).errors.length).toBeGreaterThan(0);expect(parseFile('x.csv',csv+'\n2026-09,A').errors.some(e=>e.field==='열 수')).toBe(true);});
 it('빈 자료·지원하지 않는 확장자·깨진 JSON 거부',()=>{for(const [n,t] of [['empty.csv',''],['x.txt',csv],['x.json','{bad']])expect(parseFile(n,t).errors.length).toBeGreaterThan(0);});
 it.each([{contractAmount:0},{actualProgress:101},{plannedProgress:-1},{cumulativeEarned:-1},{cumulativeEarned:1000000},{siteId:'M'},{month:'2026-13'},{region:'서울'},{projectType:'인프라'},{startDate:'2025-02-30'},{startDate:'2026-01-01'},{contractEndDate:'2024-01-01'}])('유효 범위·현장·날짜 거부 %j',patch=>expect(modified(patch).errors.length).toBeGreaterThan(0));
 it('무한대·문자·빈값 숫자 거부',()=>{for(const value of ['Infinity','NaN','x','','  ']){const c=parseFile('x.csv',asCSV([{...rows[0],actualProgress:value}]));expect(c.errors.length).toBeGreaterThan(0);}});
 it('현장 고정 정보 충돌 거부',()=>{const a=rows.find(r=>r.siteId==='A'&&r.month==='2025-11')!;expect(parseFile('x.csv',asCSV([rows[0],{...a,region:'경기'}])).errors.some(e=>e.field==='region')).toBe(true);});
 it('누적값 감소 거부·정체 허용',()=>{const a=rows.find(r=>r.siteId==='A'&&r.month==='2025-11')!;expect(parseFile('x.csv',asCSV([rows[0],{...a,actualProgress:0}])).errors.some(e=>e.field==='actualProgress')).toBe(true);const j=rows.filter(r=>r.siteId==='J');expect(parseFile('j.csv',asCSV(j)).errors).toEqual([]);});
 it('누락은 경고·부분 CSV 허용·추가 4열 무시',()=>{const c=parseFile('partial.csv',asCSV([rows[0]]));expect(c.errors).toEqual([]);expect(c.warnings.length).toBeGreaterThan(0);const header=FIELDS.join(',')+',기성률(%),공정차이(pp),상태,당월기성액(백만원)';const body=FIELDS.map(f=>rows[0][f]).join(',')+',999,999,정상,999';const again=parseFile('19.csv',header+'\n'+body);expect(again.errors).toEqual([]);expect(Object.keys(again.records[0])).toHaveLength(15);});
 it.each(['schemaVersion','moneyUnit','progressUnit','requiredFields'])('JSON 메타정보 %s 검사',field=>{const doc=JSON.parse(json);doc.metadata[field]='invalid';expect(parseFile('bad.json',JSON.stringify(doc)).errors.some(e=>e.field===field)).toBe(true);});
});
describe('공통 필터·기성 계산',()=>{
 const expected=[['16.7','19.4','19.6','0.2',null],['20.0','22.8','23.2','0.3',20408.1],['23.6','26.9','27.0','0.2',22672.4],['27.5','31.4','31.3','-0.1',25069.7],['32.2','36.7','36.2','-0.4',29249],['37.1','42.4','41.6','-0.8',31132.2],['42.3','48.6','47.1','-1.5',32658.9],['47.7','54.8','52.9','-1.9',34238],['53.2','60.7','58.3','-2.4',34466.9],['57.8','65.8','63.2','-2.6',29373.6],['62.7','69.9','67.6','-2.3',30466.2],['67.2','73.2','71.2','-2.0',28878.7]];
 it.each(MONTHS.map((month,i)=>[month,expected[i]] as const))('%s 검산표 일치', (month,e)=>{const s=summary(rows,{...filters,month});expect(s.earnedRate!.toFixed(1)).toBe(e[0]);expect(s.planned!.toFixed(1)).toBe(e[1]);expect(s.actual!.toFixed(1)).toBe(e[2]);expect(s.gap!.toFixed(1)).toBe(e[3]);if(e[4]===null)expect(s.monthly).toBeNull();else expect(s.monthly).toBeCloseTo(e[4] as number,5);});
 it('9월 계약·누적·당월을 각각 집계',()=>{const s=summary(rows,filters);expect(s.contract).toBe(630700);expect(s.earned).toBe(424063.4);expect(s.monthly).toBe(28878.7);});
 it.each([['인천',61.2],['경기',68.5],['충남',73.5],['충북',60.7],['세종',92.7],['강원',60.5],['대전',87.4]] as const)('%s 기성률', (region,expected)=>expect(format(summary(rows,{...filters,region}).earnedRate)).toBe(expected.toFixed(1)));
 it('D 단독·인천 공동주택 교집합',()=>{expect(summary(rows,{...filters,siteId:'D'}).earnedRate).toBeCloseTo(69.4);expect(summary(rows,{...filters,region:'인천',projectType:'공동주택'}).rows.map(r=>r.siteId)).toEqual(['A','G']);});
 it('지역 변경 시 범위 밖 D를 전체로 변경',()=>{expect(changeFilters(rows,{...filters,siteId:'D'},{region:'인천'}).siteId).toBe('all');expect(sitesFor(rows,{...filters,region:'인천'}).map(r=>r.siteId)).toEqual(['A','G']);});
 it('유형 변경 시 범위 밖 D를 전체로 변경',()=>expect(changeFilters(rows,{...filters,siteId:'D'},{projectType:'물류시설'}).siteId).toBe('all'));
 it('첫 달 누적은 표시하되 당월은 null',()=>{const s=summary(rows,{...filters,month:'2025-10'});expect(s.earned).toBe(105449.7);expect(s.monthly).toBeNull();expect(format(s.monthly)).toBe('계산 불가');});
 it('J 7월은 실제 0, 누적과 공정은 별개',()=>{const s=summary(rows,{...filters,month:'2026-07',siteId:'J'});expect(s.monthly).toBe(0);expect(format(s.monthly)).toBe('0.0');expect(s.actual).toBeGreaterThan(summary(rows,{...filters,month:'2026-06',siteId:'J'}).actual!);});
 it('직전월이 없으면 가까운 이전월로 대신하지 않음',()=>{const missing=rows.filter(r=>!(r.siteId==='A'&&r.month==='2026-08'));expect(summary(missing,filters).monthly).toBeNull();});
 it('당월 한 현장이 없으면 전체 당월액 계산 불가·누적은 경고 집계',()=>{const missing=rows.filter(r=>!(r.siteId==='A'&&r.month==='2026-09'));const s=summary(missing,filters);expect(s.monthly).toBeNull();expect(s.missing).toEqual(['A']);expect(s.rows).toHaveLength(11);});
 it('빈 조합·빈 자료는 0%가 아님',()=>{for(const s of [summary([],filters),summary(rows,{...filters,region:'인천',projectType:'물류시설'})]){expect(s.earnedRate).toBeNull();expect(s.monthly).toBeNull();}});
 it('선택 월까지 추이·누락 월을 null로 유지',()=>{expect(trend(rows,filters)).toHaveLength(12);expect(trend(rows,{...filters,month:'2026-07'})).toHaveLength(10);expect(trend(rows.filter(r=>r.month!=='2026-02'),filters).find(p=>p.month==='2026-02')?.planned).toBeNull();});
 it('연도 경계와 소수 차액·음의 0 표시',()=>{expect(previousMonth('2026-01')).toBe('2025-12');expect(difference(0.3,0.2)).toBe(0.1);expect(difference(65.3,68.7)).toBe(-3.4);expect(format(-0.00000001)).toBe('0.0');});
});
describe('교체·범위 상태',()=>{
 it('전체 교체는 누적하지 않음·기본 범위 복귀',()=>{const once=reducer(INITIAL_STATE,{type:'replace',candidate:normal});const filtered=reducer(once,{type:'filter',patch:{siteId:'D'}});const twice=reducer(filtered,{type:'replace',candidate:parseFile('same.json',json)});expect(twice.records).toHaveLength(144);expect(twice.filters).toEqual(DEFAULT_FILTERS);expect(twice.dataVersion).toBe(2);});
 it('오류 후보는 자료·필터를 바꾸지 않음',()=>{const state=reducer(INITIAL_STATE,{type:'replace',candidate:normal});const bad=parseFile('bad.csv',read('검증용_오류데이터/오류_공정률101.csv'));expect(reducer(state,{type:'replace',candidate:bad})).toBe(state);});
 it('범위 변경·초기화 버전 증가, 반영 자료 보존',()=>{const state=reducer(INITIAL_STATE,{type:'replace',candidate:normal});const changed=reducer(state,{type:'filter',patch:{region:'인천'}});const reset=reducer(changed,{type:'reset'});expect(reset.records).toBe(state.records);expect(reset.filters).toEqual(DEFAULT_FILTERS);expect(reset.scopeVersion).toBe(state.scopeVersion+2);});
});
