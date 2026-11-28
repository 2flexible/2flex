import { useContext } from 'react'
import { type BaseBlock } from '@2flexible/2flex'
import { ParentBlockContext } from './context'

/**
 * Returns the block the component is rendered in.
 *
 * It is the block of the parent of the component, so it is the block the
 * component is nested into. It throws when it is used outside of a block.
 */
export function useBlock(): BaseBlock {
    const block = useContext(ParentBlockContext)
    if (!block)
        throw new Error(
            '[2flex] useBlock() must be used inside of a block component.'
        )
    return block
}
