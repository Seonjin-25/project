'use client';
import Link from 'next/link';
import { useApp } from '../../state/provider';
import { EmptyState } from '../../components/shell';
export default function AI(){const {state}=useApp();return <><div className="pageHeading"><div><p className="eyebrow">AI ASSISTANT</p><h1>AI에게 묻기</h1></div></div>{!state.records.length?<EmptyState/>:<section className="panel empty"><h2>AI 설명 기능을 준비하고 있습니다</h2><p>현재는 자료 가져오기와 현황·추이를 사용할 수 있습니다. AI 호출은 아직 실행하지 않습니다.</p><Link className="primary button" href="/">현황 요약으로 이동</Link></section>}</>;}
