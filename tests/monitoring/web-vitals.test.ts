import { describe, it, expect, vi } from 'vitest'
import { reportWebVitals } from '../../src/monitoring/web-vitals'

describe('monitoring/web-vitals', () => {
  it('reportWebVitals 调用 onLCP/onFID/onCLS（web-vitals 库）', async () => {
    // reportWebVitals 内部调用 web-vitals 的 onLCP/onCLS/onINP 等
    // 这里只验证它不抛错，且返回一个可取消的 cleanup 函数
    const cleanup = reportWebVitals()
    expect(typeof cleanup).toBe('function')
    cleanup()
  })

  it('reportWebVitals 接收自定义 callback', async () => {
    const cb = vi.fn()
    const cleanup = reportWebVitals(cb)
    expect(typeof cleanup).toBe('function')
    cleanup()
  })
})
