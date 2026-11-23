import assert from 'node:assert/strict'
import test from 'node:test'
import { hex6 } from '../src/lib/monacoThemes.ts'

test('hex6 accepts optional-# six-digit hex colours', () => {
  assert.equal(hex6('#7E9BFF', 'keyword'), '7E9BFF')
  assert.equal(hex6('7e9bff', 'keyword'), '7e9bff')
})

test('hex6 rejects values Monaco cannot use for token foregrounds', () => {
  for (const value of ['', undefined, 'var(--x)', 'oklch(0.7 0.1 250)', '#fff']) {
    assert.throws(
      () => hex6(value, 'keyword'),
      /Bad Monaco colour for "keyword"/,
    )
  }
})
