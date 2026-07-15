import { describe, expect, beforeEach } from 'vitest'
import { applyTheme, clearTheme } from '../../../src/features/tenant/theme'
import type { ThemeConfig } from '../../../src/types/tenant'
import { fnTest } from '../../fn'

beforeEach(() => {
  clearTheme()
})

describe('theme 主题变量应用', () => {
  fnTest(["M01.F02.I01","M01.F02.I02"], 'applyTheme 将主题色写入 document.documentElement CSS 变量', () => {
    const theme: ThemeConfig = { primary: '#2563eb', sidebar: '#1e293b', logoText: 'ACME' }
    applyTheme(theme)
    const root = document.documentElement
    expect(root.style.getPropertyValue('--tenant-primary')).toBe('#2563eb')
    expect(root.style.getPropertyValue('--tenant-sidebar')).toBe('#1e293b')
    expect(root.style.getPropertyValue('--tenant-logo-text')).toBe('ACME')
  })

  fnTest(["M01.F02.I01","M01.F02.I02"], 'clearTheme 清除所有租户 CSS 变量', () => {
    const theme: ThemeConfig = { primary: '#059669', sidebar: '#064e3b', logoText: 'GLOBEX' }
    applyTheme(theme)
    expect(document.documentElement.style.getPropertyValue('--tenant-primary')).toBe('#059669')
    clearTheme()
    expect(document.documentElement.style.getPropertyValue('--tenant-primary')).toBe('')
    expect(document.documentElement.style.getPropertyValue('--tenant-sidebar')).toBe('')
    expect(document.documentElement.style.getPropertyValue('--tenant-logo-text')).toBe('')
  })

  fnTest(["M01.F02.I01","M01.F02.I02"], 'applyTheme 覆盖旧主题（切换租户）', () => {
    applyTheme({ primary: '#2563eb', sidebar: '#1e293b', logoText: 'ACME' })
    expect(document.documentElement.style.getPropertyValue('--tenant-primary')).toBe('#2563eb')
    applyTheme({ primary: '#059669', sidebar: '#064e3b', logoText: 'GLOBEX' })
    expect(document.documentElement.style.getPropertyValue('--tenant-primary')).toBe('#059669')
    expect(document.documentElement.style.getPropertyValue('--tenant-logo-text')).toBe('GLOBEX')
  })
})
