import { test } from 'node:test'
import assert from 'node:assert/strict'
import { safeArchivePath } from '../src/lib/demo-archive'
import { signDemoToken, verifyDemoToken } from '../src/lib/demo-token'
test('archive paths reject traversal, Windows paths, ambiguous names and devices', () => {
  for (const unsafe of [
    '../index.html',
    '/index.html',
    'C:/file',
    'a\\..\\index.html',
    'foo/../../bar',
    'con.txt',
    'foo/nul',
    'a/./b',
    'a//b',
    'a /b',
    'a./b',
  ])
    assert.equal(safeArchivePath(unsafe), false, unsafe)
  for (const safe of ['index.html', 'build/assets/app.js', '测试/index.html', 'assets/'])
    assert.equal(safeArchivePath(safe), true, safe)
})
test('preview tokens expire and cannot grant access to another demo or be forged', () => {
  process.env.PAYLOAD_SECRET = 'unit-test-only-secret-not-used-by-the-site'
  const token = signDemoToken('42')
  assert.equal(verifyDemoToken(token, '42'), true)
  assert.equal(verifyDemoToken(token, '43'), false)
  assert.equal(verifyDemoToken(token + 'a', '42'), false)
  assert.equal(verifyDemoToken(signDemoToken('42', Date.now() - 1), '42'), false)
  assert.equal(verifyDemoToken('42.NaN.anything', '42'), false)
})
