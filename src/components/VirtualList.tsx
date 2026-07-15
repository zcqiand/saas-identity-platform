import { type ReactNode, useMemo } from "react";
import type { CSSProperties } from "react";
import { FixedSizeList as BaseFixedSizeList } from "react-window";

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemSize: number;
  width: number | string;
  /** 额外渲染的可视区外行数（默认 2） */
  overscanCount?: number;
  renderItem: (props: { item: T; index: number }) => ReactNode;
  className?: string;
}

interface VirtualRowProps<T> {
  index: number;
  style: CSSProperties;
  data: T[];
  className?: string;
  renderItem: (props: { item: T; index: number }) => ReactNode;
}

/**
 * 单行渲染器。提到模块顶层以避免 react/no-unstable-nested-components
 * （每次 render 重建 component type 会卸载整棵子树）。
 */
function VirtualRow<T>({
  index,
  style,
  data,
  className,
  renderItem,
}: VirtualRowProps<T>) {
  return (
    <div style={style} data-virtual-item="true" className={className}>
      {renderItem({ item: data[index], index })}
    </div>
  );
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
  const itemData = useMemo(() => items, [items]);

  if (items.length === 0) return <div style={{ height, width }} />;

  return (
    <BaseFixedSizeList
      height={height}
      width={width}
      itemSize={itemSize}
      itemCount={items.length}
      itemData={itemData}
      overscanCount={overscanCount}
    >
      {({ index, style }) => (
        <VirtualRow
          index={index}
          style={style}
          data={itemData}
          className={className}
          renderItem={renderItem}
        />
      )}
    </BaseFixedSizeList>
  );
}
