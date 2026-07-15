import { describe, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import PasswordPolicyPage from '../../src/pages/PasswordPolicy'
import { resetApiClient, setToken } from '../../src/api/client'
import { fnTest } from '../fn'

beforeEach(() => {
  localStorage.clear()
  resetApiClient()
  setToken('mock-token')
})

describe('PasswordPolicyPage', () => {
  fnTest(["M06.F03.I01","M06.F03.I02","M06.F03.I03","M06.F03.I04","M06.F03.I05","M06.F03.I06","M06.F03.I07","M06.F03.I08","M06.F03.I09"], 'mount 后渲染页面标题', async () => {
    render(<PasswordPolicyPage />)
    await waitFor(() => expect(screen.getByText('密码策略')).toBeInTheDocument())
  })

  fnTest(["M06.F03.I01","M06.F03.I02","M06.F03.I03","M06.F03.I04","M06.F03.I05","M06.F03.I06","M06.F03.I07","M06.F03.I08","M06.F03.I09"], 'mount 后拉取配置数据并渲染密码策略项', async () => {
    render(<PasswordPolicyPage />)
    await waitFor(() => expect(screen.getByText('密码策略')).toBeInTheDocument())
    expect(screen.getByText('启用密码策略')).toBeInTheDocument()
    expect(screen.getByText('最小密码长度')).toBeInTheDocument()
    expect(screen.getByText('必须包含大写字母')).toBeInTheDocument()
    expect(screen.getByText('必须包含小写字母')).toBeInTheDocument()
    expect(screen.getByText('必须包含数字')).toBeInTheDocument()
    expect(screen.getByText('必须包含特殊字符')).toBeInTheDocument()
    expect(screen.getByText('密码过期天数')).toBeInTheDocument()
    expect(screen.getByText('历史密码数量')).toBeInTheDocument()
  })

  fnTest(["M06.F03.I01","M06.F03.I02","M06.F03.I03","M06.F03.I04","M06.F03.I05","M06.F03.I06","M06.F03.I07","M06.F03.I08","M06.F03.I09"], '渲染当前配置值', async () => {
    render(<PasswordPolicyPage />)
    await waitFor(() => expect(screen.getByText('密码策略')).toBeInTheDocument())
    expect(screen.getByDisplayValue('90')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
  })
})
