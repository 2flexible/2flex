import { type BaseBlock } from '@2flexible/2flex'

/**
 * The props of a block component.
 *
 * Every option of the block can be given as a prop, the name of the option is
 * the name of the prop. The name of an option can also be written in kebab
 * case, so `background-color` and `backgroundColor` are the same prop.
 *
 * The events of the block are given as props too, the name of the event is
 * the name of the prop, so `onClick` is the handler of the click of the
 * block.
 */
export interface BlockComponentProps {
    /**
     * The children of the block.
     *
     * Only blocks can be nested, they are attached to the block as its
     * children, so the parent lays them out.
     */
    children?: React.ReactNode
    /**
     * The handler of the click of the block.
     */
    onClick?: (event: MouseEvent) => void
    /**
     * The handler of the double click of the block.
     */
    onDblClick?: (event: MouseEvent) => void
    /**
     * The handler of the press of the mouse on the block.
     */
    onMouseDown?: (event: MouseEvent) => void
    /**
     * The handler of the release of the mouse on the block.
     */
    onMouseUp?: (event: MouseEvent) => void
    /**
     * The handler of the move of the mouse over the block.
     */
    onMouseMove?: (event: MouseEvent) => void
    /**
     * The handler of the enter of the mouse into the block.
     */
    onMouseEnter?: (event: MouseEvent) => void
    /**
     * The handler of the leave of the mouse out of the block.
     */
    onMouseLeave?: (event: MouseEvent) => void
    /**
     * The handler of the move of the mouse over the block.
     */
    onMouseOver?: (event: MouseEvent) => void
    /**
     * The handler of the move of the mouse out of the block.
     */
    onMouseOut?: (event: MouseEvent) => void
    /**
     * The handler of the menu of the mouse on the block.
     */
    onContextMenu?: (event: MouseEvent) => void
    /**
     * The handler of the wheel of the mouse on the block.
     */
    onWheel?: (event: WheelEvent) => void
}

/**
 * The events of a block and the method that registers them.
 *
 * The name of the prop of an event is the name of the event with the `on` of
 * react in front of it, so `onClick` is the click of the block.
 */
export const BLOCK_EVENTS = {
    onClick: 'click',
    onDblClick: 'dblclick',
    onMouseDown: 'mousedown',
    onMouseUp: 'mouseup',
    onMouseMove: 'mousemove',
    onMouseEnter: 'mouseenter',
    onMouseLeave: 'mouseleave',
    onMouseOver: 'mouseover',
    onMouseOut: 'mouseout',
    onContextMenu: 'contextmenu',
    onWheel: 'wheel',
} as const

/**
 * The name of the event of a prop.
 *
 * The prop of an event is not an option of the block, it is registered on the
 * block as an event.
 */
export function isEventProp(name: string): boolean {
    return Object.hasOwn(BLOCK_EVENTS, name)
}

/**
 * Turns a kebab case name into a camel case one.
 *
 * `background-color` becomes `backgroundColor`.
 */
export function toCamelCase(name: string): string {
    return name.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase())
}

/**
 * Turns a camel case name into a kebab case one.
 *
 * `backgroundColor` becomes `background-color`.
 */
export function toKebabCase(name: string): string {
    return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * Reads the options of a block from the props of a component.
 *
 * The name of an option can be written in camel case or in kebab case, both
 * spellings are the same option.
 */
export function toOptions(
    props: Record<string, unknown>
): Record<string, unknown> {
    const options: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(props)) {
        if (key === 'children') continue
        if (isEventProp(key)) continue
        options[toCamelCase(key)] = value
    }
    return options
}

/**
 * Drops the options a block does not understand.
 *
 * A prop that is not an option is dropped and reported in the console of the
 * browser.
 *
 * @param block - The block.
 * @param options - The options that were read from the props.
 */
export function toKnownOptions(
    block: BaseBlock,
    options: Record<string, unknown>
): Record<string, unknown> {
    const known: Record<string, unknown> = {}
    const unknown: string[] = []
    for (const [key, value] of Object.entries(options)) {
        if (block.__isOption(key)) known[key] = value
        else unknown.push(key)
    }
    if (unknown.length > 0) reportUnknownOptions(block, unknown)
    return known
}

/**
 * Reports the options a block does not understand.
 *
 * The report is a warning of the console of the browser, so a typo in a prop
 * is noticed without breaking the scene.
 */
function reportUnknownOptions(block: BaseBlock, options: string[]) {
    if (
        typeof process !== 'undefined' &&
        process.env?.NODE_ENV === 'production'
    )
        return
    console.warn(
        `[2flex] ${nameOfBlock(block)} does not know the option${
            options.length === 1 ? '' : 's'
        } "${options.join('", "')}". The prop was ignored.`
    )
}

/**
 * The name of a block, it is the name of the class of it.
 */
function nameOfBlock(block: BaseBlock): string {
    return block.constructor.name ?? 'the block'
}

/**
 * Returns the options that changed between two sets of props.
 *
 * Only the changed options are applied to the block, so the state of the
 * block is never clobbered by a re-render that changed nothing.
 */
export function diffOptions(
    previous: Record<string, unknown>,
    next: Record<string, unknown>
): Record<string, unknown> {
    const changed: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(next)) {
        if (!Object.is(previous[key], value)) changed[key] = value
    }
    // an option that was removed has to be reset to its default value
    for (const key of Object.keys(previous)) {
        if (!(key in next)) changed[key] = undefined
    }
    return changed
}
