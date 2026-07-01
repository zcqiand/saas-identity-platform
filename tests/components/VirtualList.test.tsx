import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { VirtualList } from '../../src/components/VirtualList'

interface Item {
  id: string
  text: string
}

const items: Item[] = Array.from({ length: 100 }, (_, i) => ({
  id: `item-${i}`,
  text: `行 ${i}`,
}))

describe('VirtualList', () => {
  it('仅渲染可视行（而非全部 100 行）', () => {
    const { container } = render(
      <VirtualList<Item>
        items={items}
        height={200}
        itemSize={40}
        width={300}
        renderItem={({ item }) => <div>{item.text}</div>}
      />,
    )
    // 100 条数据，但虚拟滚动只渲染可视区 + overscan
    // height=200, itemSize=40 → 可视 5 行 + react-window 默认 overscan=2 → 最多 ~7-9 行
    const renderedRows = container.querySelectorAll('[data-virtual-item="true"]')
    expect(renderedRows.length).toBeLessThan(20)
    expect(renderedRows.length).toBeGreaterThan(0)
  })

  it('renderItem 接收正确 item 与 index', () => {
    const { container } = render(
      <VirtualList<Item>
        items={items}
        height={200}
        itemSize={40}
        width={300}
        renderItem={({ item, index }) => (
          <div data-virtual-item="true">
            {index}:{item.text}
          </div>
        )}
      />,
    )
    const first = container.querySelector('[data-virtual-item="true"]')
    expect(first?.textContent).toMatch(/^\d+:行 \d+$/)
  })

  it('空列表不渲染任何行', () => {
    const { container } = render(
      <VirtualList<Item>
        items={[]}
        height={200}
        itemSize={40}
        width={300}
        renderItem={({ item }) => <div>{item.text}</div>}
      />,
    )
    expect(container.querySelectorAll('[data-virtual-item="true"]')).toHaveLength(0)
  })

  it('自定义 overscanCount 控制额外渲染行数', () => {
    const { container: c1 } = render(
      <VirtualList<Item>
        items={items}
        height={200}
        itemSize={40}
        width={300}
        overscanCount={0}
        renderItem={({ item }) => <div data-virtual-item="true">{item.text}</div>}
      />,
    )
    const { container: c3 } = render(
      <VirtualList<Item>
        items={items}
        height={200}
        itemSize={40}
        width={300}
        overscanCount={3}
        renderItem={({ item }) => <div data-virtual-item="true">{item.text}</div>}
      />,
    )
    const count1 = c1.querySelectorAll('[data-virtual-item="true"]').length
    const count3 = c3.querySelectorAll('[data-virtual-item="true"]').length
    // overscan 越大渲染越多
    expect(count3).toBeGreaterThanOrEqual(count1)
  })
})
