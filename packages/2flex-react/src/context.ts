import { createContext } from 'react'
import { type BaseBlock, type Canvas } from '@2flexible/2flex'

/**
 * Holds the canvas instance the current block tree belongs to.
 *
 * It is provided by the `Canvas` component and consumed by every block
 * component, so a block knows where it has to be added to.
 */
export const CanvasContext = createContext<Canvas | null>(null)

/**
 * Holds the closest parent block.
 *
 * It allows a block component to be nested into the block component above it,
 * so the parent lays it out.
 */
export const ParentBlockContext = createContext<BaseBlock | null>(null)
