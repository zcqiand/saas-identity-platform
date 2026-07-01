import { type ReactNode, useMemo } from 'react'
import { FixedSizeList as BaseFixedSizeList } from 'react-window'

interface VirtualListProps<T> {
  items: T[]
  height: number
  itemSize: number
  width: number | string
  /** 额外渲染的可视区外行数（默认 2） */
  overscanCount?: number
  renderItem: (props: { item: T; index: number }) => ReactNode
  className?: string
}

/**
 * react-window FixedSizeList 通用封装。
 * 仅渲染可视行 + overscan，大数据量时显著减少 DOM 节点。
 */
export function VirtualList<T>({
  items,
  height,
  itemSize,
  width,
  overscanCount = 2,
  renderItem,
  className,
}: VirtualListProps<T>) {
  const itemData = useMemo(() => items, [items])

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style} data-virtual-item="true" className={className}>
      {renderItem({ item: itemData[index], index })}
    </div>
  )

  if (items.length === 0) return <div style={{ height, width }} />

  return (
    <BaseFixedSizeList
      height={height}
      width={width}
      itemSize={itemSize}
      itemCount={items.length}
      itemData={itemData}
      overscanCount={overscanCount}
    >
      {Row}
    </BaseFixedSizeList>
  )
}
