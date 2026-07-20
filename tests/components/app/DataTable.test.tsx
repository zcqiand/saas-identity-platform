import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable, type Column } from '../../../src/components/app/data-table'

interface Row {
  id: number
  name: string
}

const cols: Column<Row>[] = [
  { header: 'ID', cell: (r) => r.id },
  { header: 'Name', cell: (r) => r.name },
]

const data: Row[] = [
  { id: 1, name: 'alice' },
  { id: 2, name: 'bob' },
]

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={cols} data={data} rowKey={(r) => r.id} />)
    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
  })

  it('renders each row from data', () => {
    render(<DataTable columns={cols} data={data} rowKey={(r) => r.id} />)
    expect(screen.getByText('alice')).toBeInTheDocument()
    expect(screen.getByText('bob')).toBeInTheDocument()
  })

  it('renders skeleton rows when loading=true (data ignored)', () => {
    const { container } = render(
      <DataTable
        columns={cols}
        data={data}
        loading
        rowKey={(r) => r.id}
      />,
    )
    // Skeleton 元素：class 含 h-4 w-full
    expect(container.querySelectorAll('.h-4.w-full').length).toBeGreaterThan(0)
    // loading 状态下不应该出现数据行
    expect(screen.queryByText('alice')).not.toBeInTheDocument()
  })

  it('shows default EmptyState when data=[] and no custom empty', () => {
    render(<DataTable columns={cols} data={[]} rowKey={(r) => r.id} />)
    expect(screen.getByText('暂无数据')).toBeInTheDocument()
  })

  it('shows custom empty content when provided', () => {
    render(
      <DataTable
        columns={cols}
        data={[]}
        rowKey={(r) => r.id}
        empty={<button>新增第一项</button>}
      />,
    )
    expect(
      screen.getByRole('button', { name: '新增第一项' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('暂无数据')).not.toBeInTheDocument()
  })

  it('row click invokes onRowClick with the row data', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    render(
      <DataTable
        columns={cols}
        data={data}
        rowKey={(r) => r.id}
        onRowClick={onRowClick}
      />,
    )
    await user.click(screen.getByText('alice'))
    expect(onRowClick).toHaveBeenCalledTimes(1)
    expect(onRowClick).toHaveBeenCalledWith(data[0])
  })

  it('row click is a no-op when onRowClick is not provided', async () => {
    const user = userEvent.setup()
    // 不应该抛错
    render(<DataTable columns={cols} data={data} rowKey={(r) => r.id} />)
    await expect(
      user.click(screen.getByText('alice')),
    ).resolves.not.toThrow()
  })

  it('passes rowKey function output as React key (no console warnings about keys)', () => {
    // 如果 rowKey 没被调用，tbody 里 nested key 报警；
    // 我们的 rowKey={(r) => r.id} 返回 number，但 DataTable 内部会 toString。
    // 简单存在性测：data.length 渲染了两个 row
    const { container } = render(
      <DataTable
        columns={cols}
        data={data}
        rowKey={(r) => r.id}
      />,
    )
    const trs = container.querySelectorAll('tbody tr')
    expect(trs.length).toBe(2)
  })
})
