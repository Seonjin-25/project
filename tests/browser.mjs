import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const origin=process.env.TEST_BASE_URL||'http://127.0.0.1:3000';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},locale:'ko-KR'});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const file=name=>path.resolve('data',name);
const metric=name=>page.getByRole('region',{name,exact:true});
async function contains(locator,text){assert.ok((await locator.innerText()).includes(text),`Expected visible text: ${text}`);}
async function upload(name){await page.getByRole('link',{name:'자료 가져오기',exact:true}).first().click();await page.getByLabel('자료 파일',{exact:true}).setInputFiles(file(name));await page.getByRole('heading',{name:'검사 결과',exact:true}).waitFor();}
async function commit(){await page.getByRole('button',{name:'전체 교체',exact:true}).click();await page.getByRole('heading',{name:'현황 요약',exact:true}).waitFor();}
try{
 await page.goto(origin);await page.getByRole('heading',{name:'아직 가져온 자료가 없습니다'}).waitFor();
 for(const name of ['현장별 비교표','AI에게 묻기','자료 가져오기','현황 요약']){await page.getByRole('navigation',{name:'주 메뉴'}).getByRole('link',{name,exact:true}).click();await page.getByRole('heading',{name,exact:true,level:1}).waitFor();}
 console.log('PASS: S01 empty state and four-page navigation');
 await upload('현장공정기성.csv');await contains(page.locator('.validationStats'),'144행');await contains(page.locator('.preview'),'기록된 대응 계획');await commit();await contains(metric('전체 기성률'),'67.2');await contains(metric('계획공정률'),'73.2');await contains(metric('실제공정률'),'71.2');await contains(metric('공정차이'),'-2.0');await contains(page.getByRole('region',{name:'기성 금액'}),'28,878.7');
 console.log('PASS: S02/S05 import preview, 144 records, September metrics');
 await upload('현장공정기성.json');await commit();await contains(page.locator('.recordCount'),'144행');
 for(const name of ['오류_중복키.csv','오류_공정률101.csv','오류_공정률빈값.csv']){await upload(`검증용_오류데이터/${name}`);await page.getByRole('alert').waitFor();assert.equal(await page.getByRole('button',{name:'전체 교체',exact:true}).isDisabled(),true);await page.getByRole('navigation').getByRole('link',{name:'현황 요약',exact:true}).click();await contains(metric('전체 기성률'),'67.2');}
 await upload('현장공정기성.csv');await page.getByRole('button',{name:'미리보기 취소'}).click();await contains(page.getByRole('status'),'기존 자료와 필터는 그대로');await page.getByRole('navigation').getByRole('link',{name:'현황 요약',exact:true}).click();await contains(metric('전체 기성률'),'67.2');
 console.log('PASS: S03 all three errors and cancellation preserve existing data');
 await page.getByLabel('지역',{exact:true}).selectOption('인천');await page.getByLabel('공사 유형',{exact:true}).selectOption('공동주택');await contains(metric('전체 기성률'),'61.2');await contains(page.locator('.rangeBadge'),'2개 현장');const options=await page.getByLabel('현장',{exact:true}).locator('option').allTextContents();assert.equal(options.length,3);assert.ok(options.some(x=>x.includes('[A]')));assert.ok(options.some(x=>x.includes('[G]')));
 await page.getByRole('button',{name:'↻ 초기화'}).click();await page.getByLabel('현장',{exact:true}).selectOption('D');await contains(metric('전체 기성률'),'69.4');await page.getByLabel('지역',{exact:true}).selectOption('인천');assert.equal(await page.getByLabel('현장',{exact:true}).inputValue(),'all');
 await page.getByLabel('공사 유형',{exact:true}).selectOption('물류시설');await page.getByRole('heading',{name:'선택한 범위에 자료가 없습니다'}).waitFor();await contains(metric('전체 기성률'),'계산 불가');
 console.log('PASS: S04 filter intersections, dependent site reset, empty combination');
 await page.getByRole('button',{name:'↻ 초기화'}).click();assert.equal(await page.locator('svg [role=button]').count(),12);await page.getByLabel('기준 월',{exact:true}).selectOption('2026-07');await contains(metric('전체 기성률'),'57.8');assert.equal(await page.locator('svg [role=button]').count(),10);await page.getByLabel('기준 월',{exact:true}).selectOption('2025-10');await contains(page.getByRole('region',{name:'기성 금액'}),'105,449.7');await contains(page.locator('.chartReadout'),'계산 불가');
 await page.getByLabel('기준 월',{exact:true}).selectOption('2026-07');await page.getByLabel('현장',{exact:true}).selectOption('J');await contains(page.locator('.chartReadout'),'0.0 백만원');await page.getByRole('button',{name:'2026-06 월별 값 보기',exact:true}).focus();await contains(page.locator('.chartReadout'),'2026-06');
 console.log('PASS: S06 trend cutoff, first-month null, J July zero, keyboard values');
 await page.getByRole('button',{name:'↻ 초기화'}).click();await mkdir('artifacts',{recursive:true});await page.screenshot({path:'artifacts/epic1-overview.png',fullPage:true});
 await page.getByRole('navigation').getByRole('link',{name:'자료 가져오기',exact:true}).click();await page.getByLabel('지역',{exact:true}).selectOption('인천');await page.getByLabel('자료 파일',{exact:true}).setInputFiles(file('현장공정기성.json'));await page.getByRole('heading',{name:'검사 결과'}).waitFor();await page.getByRole('navigation').getByRole('link',{name:'현황 요약',exact:true}).click();await contains(metric('전체 기성률'),'61.2');await page.getByRole('navigation').getByRole('link',{name:'자료 가져오기',exact:true}).click();assert.equal(await page.getByRole('heading',{name:'검사 결과'}).count(),0);
 console.log('PASS: uncommitted preview discarded on navigation, filters retained');
 await page.setViewportSize({width:768,height:1000});await page.getByRole('navigation').getByRole('link',{name:'현황 요약',exact:true}).click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
 await page.reload();await page.getByRole('heading',{name:'아직 가져온 자료가 없습니다'}).waitFor();assert.deepEqual(errors,[]);console.log('PASS: narrow layout, refresh clears data, no browser runtime errors');
}catch(e){await mkdir('artifacts',{recursive:true});await page.screenshot({path:'artifacts/browser-failure.png',fullPage:true});throw e;}finally{await browser.close();}
