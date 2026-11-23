import assert from 'node:assert/strict'
import test from 'node:test'
import { getErrorMessage } from '../src/lib/errors.ts'

const axiosError = (data) => Object.assign(new Error('Request failed'), {
  isAxiosError: true,
  response: { data },
})

test('getErrorMessage extracts a nested Cloudinary error message', () => {
  assert.equal(
    getErrorMessage(axiosError({ error: { message: 'Invalid upload signature' } }), 'Upload failed'),
    'Invalid upload signature',
  )
})

test('getErrorMessage falls back instead of returning an error object', () => {
  assert.equal(
    getErrorMessage(axiosError({ error: { code: 'upload_error' } }), 'Upload failed'),
    'Upload failed',
  )
})

test('getErrorMessage keeps string API messages and ordinary Error messages', () => {
  assert.equal(getErrorMessage(axiosError({ message: 'Problem not found' }), 'Upload failed'), 'Problem not found')
  assert.equal(getErrorMessage(new Error('File is unreadable'), 'Upload failed'), 'File is unreadable')
})
