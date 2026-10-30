import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
require('../scripts/filesystem-compat.cjs');
describe('FAT32 일반 파일 readlink 호환', () => {
 it('동기 호출은 일반 파일을 EINVAL로 처리', () => {
  try { fs.readlinkSync('package.json'); throw new Error('readlink unexpectedly succeeded'); }
  catch (error) { expect((error as NodeJS.ErrnoException).code).toBe('EINVAL'); }
 });
 it('Promise 호출도 일반 파일을 EINVAL로 처리', async () => {
  await expect(fs.promises.readlink('package.json')).rejects.toHaveProperty('code', 'EINVAL');
 });
 it('콜백 호출도 일반 파일을 EINVAL로 처리', async () => {
  const code = await new Promise(resolve => fs.readlink('package.json', error => resolve(error?.code)));
  expect(code).toBe('EINVAL');
 });
 it('존재하지 않는 파일의 오류는 변경하지 않음', async () => {
  await expect(fs.promises.readlink('missing-file-for-readlink-test')).rejects.toHaveProperty('code', 'ENOENT');
 });
});
