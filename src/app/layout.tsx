import type { Metadata } from 'next';
import { AppProvider } from '../state/provider';
import { Shell } from '../components/shell';
import './globals.css';
export const metadata:Metadata={title:'현장별 공정·기성 대시보드',description:'교육용 가상 현장의 월별 공정·기성 현황을 비교합니다.'};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="ko"><body><AppProvider><Shell>{children}</Shell></AppProvider></body></html>; }
