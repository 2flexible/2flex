import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { type Root } from 'react-dom/client'

/**
 * A rendered tree of react.
 */
export interface Rendered {
    /**
     * The root of the tree, it is unmounted by `cleanup`.
     */
    root: Root
    /**
     * The element the tree is rendered into.
     */
    container: HTMLElement
}

/**
 * Renders a tree of react into a container and returns it.
 *
 * The tree is unmounted by `cleanup`, so the effects of the tree run and the
 * canvas of the tree releases itself.
 */
export const render = (element: React.ReactNode): Rendered => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    act(() => {
        root.render(element)
    })
    return { root, container }
}

/**
 * Renders a tree of react again, into the container it was rendered into.
 *
 * The tree keeps its state, so it is the way to test a change of the props
 * of a component.
 */
export const rerender = (
    rendered: Rendered,
    element: React.ReactNode
): Rendered => {
    act(() => {
        rendered.root.render(element)
    })
    return rendered
}

/**
 * Unmounts a tree of react and drops its container.
 */
export const cleanup = ({ root, container }: Rendered) => {
    act(() => {
        root.unmount()
    })
    container.remove()
}

/**
 * The canvas element of a rendered tree.
 *
 * The canvas is created in a layout effect, so it exists after the tree is
 * rendered.
 */
export const canvasOf = ({ container }: Rendered): HTMLCanvasElement => {
    const canvas = container.querySelector('canvas')
    if (!canvas)
        throw new Error('[2flex] the tree does not hold a canvas element.')
    return canvas as HTMLCanvasElement
}

/**
 * Lets the frames of the canvas pass, so the blocks are drawn.
 */
export const flush = async (frames = 2) => {
    for (let i = 0; i < frames; i++)
        await new Promise<void>((resolve) =>
            requestAnimationFrame(() => resolve())
        )
}

/**
 * Dispatches a mouse event on an element.
 *
 * The position of the event is relative to the element, so the event lands
 * on the place of the canvas it points at.
 */
export const dispatchMouse = (
    element: HTMLElement,
    type: string,
    x: number,
    y: number,
    buttons = 0
) => {
    const rect = element.getBoundingClientRect()
    element.dispatchEvent(
        new MouseEvent(type, {
            clientX: rect.left + x,
            clientY: rect.top + y,
            button: 0,
            buttons,
            bubbles: true,
            cancelable: true,
        })
    )
}

/**
 * Lets the mouse events reach the blocks of the canvas.
 *
 * The canvas only delivers the events of the mouse while the pointer is
 * considered inside of it, which is tracked by a real mouseenter event.
 */
export const allowMouse = (element: HTMLElement) =>
    element.dispatchEvent(new MouseEvent('mouseenter'))
