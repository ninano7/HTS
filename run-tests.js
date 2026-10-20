/**
 * CLI Test Runner for Acceptance Criteria
 */

// Node.js 환경에서 localStorage 모의(mock)
if (typeof localStorage === 'undefined') {
  const store = {};
  global.localStorage = {
    getItem: key => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: key => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

import { AcceptanceTests } from './js/tests/acceptance-tests.js';

console.log('====================================================');
console.log('Industry Insight HTS - 수용 기준(AC-01~AC-17) 자동 검증');
console.log('====================================================\n');

const results = AcceptanceTests.runAll();
let passCount = 0;

results.forEach(r => {
  const icon = r.status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} [${r.id}] ${r.name.padEnd(45, ' ')} : ${r.status} (${r.message})`);
  if (r.status === 'PASS') passCount++;
});

console.log('\n----------------------------------------------------');
console.log(`검증 결과: 총 ${results.length}개 항목 중 ${passCount}개 통과 (성공률: ${(passCount / results.length * 100).toFixed(1)}%)`);
console.log('====================================================');

if (passCount !== results.length) {
  process.exit(1);
} else {
  console.log('모든 수용 기준(AC-01 ~ AC-17) 완벽 통과!\n');
}
