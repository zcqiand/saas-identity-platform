import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { initSentry, captureError, isSentryEnabled } from '../../src/monitoring/sentry'

const originalEnv = { ...import.meta.env }

beforeEach(() => {
  // 重置 env
  Object.defineProperty(import.meta, 'env', { value: { ...originalEnv }, writable: true })
})

afterEach(() => {
  Object.defineProperty(import.meta, 'env', { value: originalEnv, writable: true })
})

describe('monitoring/sentry', () => {
  it('DSN 为空时 initSentry no-op，isSentryEnabled 返回 false', () => {
    Object.defineProperty(import.meta, 'env', {
      value: { ...originalEnv, VITE_SENTRY_DSN: '' },
      writable: true,
    })
    initSentry()
    expect(isSentryEnabled()).toBe(false)
  })

  it('DSN 非空时 initSentry 不抛错（jsdom 环境下降级处理）', () => {
    Object.defineProperty(import.meta, 'env', {
      value: { ...originalEnv, VITE_SENTRY_DSN: 'https://example@sentry.io/123' },
      writable: true,
    })
    // jsdom 下 Sentry.init 可能降级，但不应抛错
    expect(() => initSentry()).not.toThrow()
  })

  it('captureError 在 Sentry 未启用时不抛错', () => {
    Object.defineProperty(import.meta, 'env', {
      value: { ...originalEnv, VITE_SENTRY_DSN: '' },
      writable: true,
    })
    initSentry()
    expect(() => captureError(new Error('test'))).not.toThrow()
  })

  it('captureError 在 Sentry 启用时不抛错', () => {
    Object.defineProperty(import.meta, 'env', {
      value: { ...originalEnv, VITE_SENTRY_DSN: 'https://example@sentry.io/123' },
      writable: true,
    })
    initSentry()
    expect(() => captureError(new Error('test'))).not.toThrow()
  })
})
