import { MONTHS, type SiteRecord } from './data';
export type Filters = { month: string; region: string; projectType: string; siteId: string };
export const DEFAULT_FILTERS: Filters = { month:'2026-09', region:'all', projectType:'all', siteId:'all' };
const digits = (n: number) => { const [base, exponent] = String(n).toLowerCase().split('e'); return Math.max(0,(base.split('.')[1]?.length ?? 0) - Number(exponent ?? 0)); };
export function difference(a: number, b: number) { const scale = 10 ** Math.max(digits(a),digits(b)); return (Math.round(a*scale)-Math.round(b*scale))/scale; }
export function sum(values: number[]) { const scale = 10 ** Math.max(0,...values.map(digits)); return values.reduce((acc,n)=>acc+Math.round(n*scale),0)/scale; }
export function format(value: number | null, unit = '') { if (value === null || !Number.isFinite(value)) return '계산 불가'; const rounded = Math.round(value * 10) / 10; return new Intl.NumberFormat('ko-KR',{minimumFractionDigits:1,maximumFractionDigits:1}).format(Object.is(rounded,-0) ? 0 : rounded) + unit; }
export function previousMonth(month: string) { const [y,m] = month.split('-').map(Number); return m === 1 ? `${y-1}-12` : `${y}-${String(m-1).padStart(2,'0')}`; }
export function matches(record: SiteRecord, f: Filters) { return (f.region === 'all' || record.region === f.region) && (f.projectType === 'all' || record.projectType === f.projectType) && (f.siteId === 'all' || record.siteId === f.siteId); }
export function sitesFor(records: SiteRecord[], f: Filters) { return [...new Map(records.filter(r=>matches(r,{...f,siteId:'all'})).map(r=>[r.siteId,r])).values()].sort((a,b)=>a.siteId.localeCompare(b.siteId)); }
export function changeFilters(records: SiteRecord[], current: Filters, patch: Partial<Filters>): Filters { const next={...current,...patch}; if (next.siteId !== 'all' && !records.some(r=>r.siteId===next.siteId && matches(r,next))) next.siteId='all'; return next; }
export function summary(records: SiteRecord[], f: Filters) {
  const scope=records.filter(r=>matches(r,f));
  const expected=[...new Set(scope.map(r=>r.siteId))];
  const rows=scope.filter(r=>r.month===f.month);
  const byKey=new Map(scope.map(r=>[`${r.month}/${r.siteId}`,r]));
  const contract=rows.length ? sum(rows.map(r=>r.contractAmount)) : null;
  const earned=rows.length ? sum(rows.map(r=>r.cumulativeEarned)) : null;
  const planned=contract ? rows.reduce((a,r)=>a+r.contractAmount*r.plannedProgress,0)/contract : null;
  const actual=contract ? rows.reduce((a,r)=>a+r.contractAmount*r.actualProgress,0)/contract : null;
  const monthlyValues=expected.map(id=>{ const now=byKey.get(`${f.month}/${id}`); const prev=byKey.get(`${previousMonth(f.month)}/${id}`); return now && prev ? difference(now.cumulativeEarned,prev.cumulativeEarned) : null; });
  const monthly=expected.length && monthlyValues.every(v=>v!==null) ? sum(monthlyValues as number[]) : null;
  return { rows, contract, earned, earnedRate: contract && earned!==null ? earned/contract*100 : null, planned, actual, gap: planned!==null && actual!==null ? actual-planned : null, monthly, expectedCount:expected.length, missing:expected.filter(id=>!rows.some(r=>r.siteId===id)), monthlyReason: monthly!==null ? '' : rows.length ? '바로 전월 자료가 없거나 일부 현장의 당월·전월 자료가 빠져 있습니다.' : '선택한 범위에 자료가 없습니다.' };
}
export type Summary=ReturnType<typeof summary>;
export type TrendPoint=Summary & {month:string};
export function trend(records: SiteRecord[], f: Filters): TrendPoint[] { const start=records.map(r=>r.month).sort()[0]; return MONTHS.filter(m=>m>=start && m<=f.month).map(month=>({...summary(records,{...f,month}),month})); }
