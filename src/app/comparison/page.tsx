'use client';
import Link from 'next/link';
import { useApp } from '../../state/provider';
import { EmptyState } from '../../components/shell';
export default function Comparison(){const {state}=useApp();return <><div className="pageHeading"><div><p className="eyebrow">SITE COMPARISON</p><h1>현장별 비교표</h1></div></div>{!state.records.length?<EmptyState/>:<section className="panel empty"><h2>현장별 비교 기능을 준비하고 있습니다</h2><p>자료 {state.records.length}행과 현재 선택 범위가 유지됩니다. 현황 요약에서 숫자와 추이를 확인할 수 있습니다.</p><Link className="primary button" href="/">현황 요약으로 이동</Link></section>}</>;}
