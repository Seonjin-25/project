'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MONTHS, REGIONS, TYPES } from '../lib/data';
import { sitesFor, type Filters } from '../lib/domain';
import { useApp } from '../state/provider';
const navigation=[['/','현황 요약'],['/comparison','현장별 비교표'],['/import','자료 가져오기'],['/ai','AI에게 묻기']];
export function Shell({children}:{children:React.ReactNode}) {
 const pathname=usePathname(); const {state,dispatch}=useApp(); const {filters,records}=state;
 const set=(field:keyof Filters,value:string)=>dispatch({type:'filter',patch:{[field]:value}});
 const choices=sitesFor(records,filters);
 return <><header className="header"><div className="headerTop"><Link className="brand" href="/"><span className="brandIcon" aria-hidden="true">▦</span><span>현장별 공정·기성 대시보드</span></Link><nav aria-label="주 메뉴">{navigation.map(([href,title])=><Link key={href} href={href} aria-current={pathname===href?'page':undefined}>{title}</Link>)}</nav><span className="training">교육용 가상 자료</span></div><div className="filterBar" aria-label="조회 범위"><label>기준 월<select aria-label="기준 월" value={filters.month} onChange={e=>set('month',e.target.value)}>{[...MONTHS].reverse().map(m=><option key={m} value={m}>{m.replace('-','년 ')}월</option>)}</select></label><label>지역<select aria-label="지역" value={filters.region} onChange={e=>set('region',e.target.value)}><option value="all">전체 지역</option>{REGIONS.map(v=><option key={v}>{v}</option>)}</select></label><label>공사 유형<select aria-label="공사 유형" value={filters.projectType} onChange={e=>set('projectType',e.target.value)}><option value="all">전체 유형</option>{TYPES.map(v=><option key={v}>{v}</option>)}</select></label><label className="siteSelect">현장<select aria-label="현장" value={filters.siteId} onChange={e=>set('siteId',e.target.value)}><option value="all">전체 현장 ({choices.length}곳)</option>{choices.map(r=><option key={r.siteId} value={r.siteId}>[{r.siteId}] {r.siteName}</option>)}</select></label><div className="filterEnd"><span className="recordCount">{records.length ? `반영 자료 ${records.length}행` : '자료 없음'}</span><button className="plain" onClick={()=>dispatch({type:'reset'})}>↻ 초기화</button></div></div></header><main>{children}</main><footer><span>현장별 공정·기성 대시보드</span><span>교육용 가상 데이터 · 금액: 백만원 · 공정차이: pp</span><span>새로고침하면 파일을 다시 가져옵니다.</span></footer></>;
}
export function EmptyState({filtered=false}:{filtered?:boolean}) { return <section className="empty panel"><div className="emptyIcon" aria-hidden="true">▤</div><h2>{filtered?'선택한 범위에 자료가 없습니다':'아직 가져온 자료가 없습니다'}</h2><p>{filtered?'월·지역·유형·현장을 다시 선택해 주세요. 자료가 없는 지표는 계산 불가로 표시합니다.':'CSV 또는 JSON을 검사하고 미리 본 뒤 현황을 확인할 수 있습니다.'}</p><Link className="primary button" href="/import">자료 가져오기 <span aria-hidden="true">→</span></Link></section>; }
