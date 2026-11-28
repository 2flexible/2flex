import { type ReactNode, type Ref } from 'react'
import { type BaseBlock, type BlockOptionsOf } from '@2flexible/2flex'
import { type BlockComponentProps } from './options'

/**
 * The class of a block, it is constructed with the options of the block.
 *
 * The options of a block class are generic, so they are not described here,
 * the props of the component hold them.
 */
export type BlockConstructor<T extends BaseBlock = BaseBlock> = new (
    options?: any
) => T

/**
 * The props of a component of a block.
 *
 * They are the options of the block, so a component of a rectangle knows the
 * `backgroundColor` of a rectangle.
 */
export type BlockComponentPropsOf<T extends BaseBlock> = Partial<
    Omit<BlockOptionsOf<T>, 'children'>
> &
    BlockComponentProps

/**
 * The props of a component of a block, with the ref of the block.
 */
export type BlockComponentRefProps<T extends BaseBlock> =
    BlockComponentPropsOf<T> & { ref?: Ref<T> }

/**
 * The component of a block, it forwards the instance of it to a ref.
 */
export type BlockComponent<T extends BaseBlock = BaseBlock> = {
    (props: BlockComponentPropsOf<T> & { ref?: Ref<T> }): ReactNode
    displayName?: string
}
