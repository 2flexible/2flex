import type { Block, Canvas } from '@2flexible/2flex'

// the canvas applies every queued change (block init, option recalculation,
// dom event registration, drawing) inside its render loop which is driven by
// requestAnimationFrame, so tests have to let frames pass before asserting
export const flush = async (frames = 2) => {
    for (let i = 0; i < frames; i++)
        await new Promise<void>((resolve) =>
            requestAnimationFrame(() => resolve())
        )
}

// mouse events are only dispatched to blocks while the pointer is considered
// inside the canvas, which is tracked by a real mouseenter event
export const allowMouse = (target: Canvas) =>
    target.canvas.dispatchEvent(new MouseEvent('mouseenter'))

// animations are driven by the render loop in real time, so finishing ones
// have to be waited for instead of being flushed a fixed amount of frames
export const waitFor = async (predicate: () => boolean, timeout = 3000) => {
    const start = performance.now()
    while (!predicate()) {
        if (performance.now() - start > timeout) return false
        await new Promise((resolve) => setTimeout(resolve, 16))
    }
    return true
}

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

// makes a block paint its own box, so what ends up on the canvas can be
// asserted by screenshot
export const drawFilledBlock = (block: Block) => {
    block.set({
        onRender: () => {
            const context = block.context
            if (!context) return
            context.beginPath()
            context.fillStyle = 'red'
            context.fillRect(
                block.x(),
                block.y(),
                block.width(),
                block.height()
            )
        },
    })
}

// every test creates its own canvas element, they have to be dropped again
// so they do not pile up in the document and keep their render loops running
export const removeCanvasElements = () => {
    document.querySelectorAll('canvas').forEach((element) => element.remove())
}
