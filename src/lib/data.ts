export const FIELDS = ['month','siteId','siteName','contractAmount','plannedProgress','actualProgress','cumulativeEarned','region','projectType','startDate','contractEndDate','currentWork','issueCategory','issueSummary','actionPlan'] as const;
export type Field = typeof FIELDS[number];
export type SiteRecord = { month: string; siteId: string; siteName: string; contractAmount: number; plannedProgress: number; actualProgress: number; cumulativeEarned: number; region: string; projectType: string; startDate: string; contractEndDate: string; currentWork: string; issueCategory: string; issueSummary: string; actionPlan: string };
export const REGIONS = ['인천','경기','충남','충북','세종','강원','대전'];
export const TYPES = ['공동주택','물류시설','업무시설','상업시설','생산시설'];
export const MONTHS = Array.from({ length: 12 }, (_, i) => `${i < 3 ? 2025 : 2026}-${String(i < 3 ? i + 10 : i - 2).padStart(2, '0')}`);
export type Problem = { row?: number; field: string; message: string; value?: string };
export type Candidate = { fileName: string; records: SiteRecord[]; totalRows: number; errors: Problem[]; warnings: Problem[] };
type ParsedRow = { cells: string[]; line: number };

// CSV records can contain quoted commas, newlines, and doubled quotes.
export function parseCSV(source: string): ParsedRow[] {
  const text = source.replace(/^\uFEFF/, '');
  const rows: ParsedRow[] = [];
  let cells: string[] = [], cell = '', quoted = false, closed = false, line = 1, startLine = 1;
  const endCell = () => { cells.push(cell); cell = ''; closed = false; };
  const endRow = () => { endCell(); if (cells.some(c => c.trim() !== '')) rows.push({ cells, line: startLine }); cells = []; };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') { quoted = false; closed = true; }
      else { cell += ch; if (ch === '\n') line++; }
    } else if (ch === '"') {
      if (cell.length || closed) throw new Error(`${line}행: 따옴표 위치가 올바르지 않습니다.`);
      quoted = true;
    } else if (ch === ',') { endCell(); }
    else if (ch === '\n' || ch === '\r') {
      endRow(); if (ch === '\r' && text[i + 1] === '\n') i++;
      line++; startLine = line;
    } else {
      if (closed && !/\s/.test(ch)) throw new Error(`${line}행: 닫는 따옴표 뒤에 올 수 없는 글자가 있습니다.`);
      if (!closed) cell += ch;
    }
  }
  if (quoted) throw new Error(`${startLine}행: 닫히지 않은 따옴표가 있습니다.`);
  if (cell.length || cells.length || closed) endRow();
  return rows;
}
function object(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === value;
}
export function monthEnd(month: string) {
  const [year, m] = month.split('-').map(Number);
  return `${month}-${new Date(Date.UTC(year,m,0)).getUTCDate()}`;
}
export function parseFile(fileName: string, text: string): Candidate {
  const result: Candidate = { fileName, records: [], totalRows: 0, errors: [], warnings: [] };
  const fail = (field: string, message: string, row?: number, value?: unknown) => result.errors.push({ field, message, row, value: value === undefined ? undefined : String(value) });
  let raw: { data: unknown; line: number }[] = [];
  try {
    if (fileName.toLowerCase().endsWith('.csv')) {
      const table = parseCSV(text);
      if (!table.length) throw new Error('파일이 비어 있습니다.');
      const headers = table[0].cells.map(c => c.trim());
      if (new Set(headers).size !== headers.length) fail('헤더','같은 열 이름이 중복되어 있습니다.',1);
      for (const field of FIELDS) if (!headers.includes(field)) fail(field,'필수 열이 없습니다.',1);
      result.totalRows = table.length - 1;
      if (result.errors.length) return result;
      raw = table.slice(1).map(({ cells, line }) => {
        if (cells.length !== headers.length) fail('열 수', `헤더 ${headers.length}개와 행의 열 ${cells.length}개가 다릅니다.`,line);
        return { line, data: Object.fromEntries(headers.map((h,i) => [h, cells[i]])) };
      });
    } else if (fileName.toLowerCase().endsWith('.json')) {
      const doc: unknown = JSON.parse(text.replace(/^\uFEFF/,''));
      if (!object(doc) || !object(doc.metadata) || !Array.isArray(doc.records)) throw new Error('metadata와 records 배열이 있는 JSON이 필요합니다.');
      const meta = doc.metadata;
      if (String(meta.schemaVersion) !== '2.0') fail('schemaVersion','2.0 형식이 필요합니다.');
      if (meta.moneyUnit !== '백만원') fail('moneyUnit','금액 단위는 백만원이어야 합니다.');
      if (meta.progressUnit !== 'percent_0_100') fail('progressUnit','비율 단위는 percent_0_100이어야 합니다.');
      if (!Array.isArray(meta.requiredFields) || !FIELDS.every(f => (meta.requiredFields as unknown[]).includes(f))) fail('requiredFields','원본 필수 15개 필드 선언을 확인해 주세요.');
      result.totalRows = doc.records.length;
      raw = doc.records.map((data, i) => ({ data, line: i + 1 }));
    } else throw new Error('CSV 또는 JSON 파일을 선택해 주세요.');
  } catch (error) { fail('파일',error instanceof SyntaxError ? 'JSON 형식을 읽을 수 없습니다.' : error instanceof Error ? error.message : '파일을 읽을 수 없습니다.'); return result; }
  if (!raw.length) fail('자료','반영할 행이 없습니다.');
  const numeric: Field[] = ['contractAmount','plannedProgress','actualProgress','cumulativeEarned'];
  const seen = new Map<string, number>();
  const bySite = new Map<string, { record: SiteRecord; line: number }[]>();
  for (const { data, line } of raw) {
    if (!object(data)) { fail('행','필드와 값으로 이루어진 행이 필요합니다.',line); continue; }
    const before = result.errors.length;
    const clean: Record<string, string | number> = {};
    for (const field of FIELDS) {
      const value = data[field];
      if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) { fail(field,'필수값이 비어 있습니다. 빈칸은 0으로 처리하지 않습니다.',line); continue; }
      if (numeric.includes(field)) {
        const syntax = typeof value === 'number' || (typeof value === 'string' && /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim()));
        const n = syntax ? Number(value) : NaN;
        if (!Number.isFinite(n)) { fail(field,'유한한 숫자를 입력해 주세요.',line,value); continue; }
        clean[field] = n;
      } else {
        if (typeof value !== 'string') { fail(field,'문자열 값이 필요합니다.',line,value); continue; }
        clean[field] = value;
      }
    }
    if (result.errors.length !== before) continue;
    const row = clean as SiteRecord;
    if (!MONTHS.includes(row.month)) fail('month','2025-10~2026-09의 YYYY-MM 형식이 필요합니다.',line,row.month);
    if (!/^[A-L]$/.test(row.siteId)) fail('siteId','현장 ID는 A~L입니다.',line,row.siteId);
    if (!row.siteName.includes('[가상]')) fail('siteName','현장명에 [가상] 표시가 필요합니다.',line,row.siteName);
    if (!REGIONS.includes(row.region)) fail('region','정해진 7개 지역 중 하나여야 합니다.',line,row.region);
    if (!TYPES.includes(row.projectType)) fail('projectType','정해진 5개 공사 유형 중 하나여야 합니다.',line,row.projectType);
    if (!(row.contractAmount > 0)) fail('contractAmount','계약금액은 0보다 커야 합니다.',line,row.contractAmount);
    for (const field of ['plannedProgress','actualProgress'] as const) if (row[field] < 0 || row[field] > 100) fail(field,'공정률은 0~100이어야 합니다.',line,row[field]);
    if (row.cumulativeEarned < 0 || row.cumulativeEarned > row.contractAmount) fail('cumulativeEarned','누적기성액은 0 이상, 계약금액 이하여야 합니다.',line,row.cumulativeEarned);
    if (!validDate(row.startDate) || !validDate(row.contractEndDate) || row.startDate >= row.contractEndDate) fail('공사기간','실제 날짜 YYYY-MM-DD와 착공일 < 계약상 준공일을 확인해 주세요.',line);
    if (MONTHS.includes(row.month) && validDate(row.startDate) && monthEnd(row.month) < row.startDate) fail('startDate','기준 월말이 착공일보다 빠릅니다.',line,row.startDate);
    const key = `${row.month}/${row.siteId}`;
    if (seen.has(key)) fail('month + siteId',`${key}가 ${seen.get(key)}행과 중복입니다.`,line,key);
    else seen.set(key,line);
    const site = bySite.get(row.siteId) ?? [];
    const first = site[0]?.record;
    if (first) for (const field of ['siteName','region','projectType','contractAmount','startDate','contractEndDate'] as const) if (first[field] !== row[field]) fail(field,'같은 현장의 정보가 월마다 다릅니다.',line,row[field]);
    site.push({ record: row, line }); bySite.set(row.siteId,site);
    result.records.push(row);
  }
  for (const [siteId, entries] of bySite) {
    entries.sort((a,b) => a.record.month.localeCompare(b.record.month));
    for (let i = 1; i < entries.length; i++) for (const field of ['plannedProgress','actualProgress','cumulativeEarned'] as const) {
      if (entries[i].record[field] < entries[i - 1].record[field]) fail(field,`${siteId}의 누적값이 이전 기록보다 감소했습니다.`,entries[i].line,entries[i].record[field]);
    }
    const missing = MONTHS.filter(m => !entries.some(e => e.record.month === m));
    if (missing.length) result.warnings.push({ field:'month', message:`${siteId}: ${missing.join(', ')} 자료 없음. 확인 가능한 행만 집계하며 빠진 월은 추정하지 않습니다.` });
  }
  if (bySite.size < 12 && raw.length) result.warnings.push({ field:'siteId', message:`12개 현장 중 ${bySite.size}개 현장 자료입니다. 가져온 범위만 집계합니다.` });
  return result;
}
