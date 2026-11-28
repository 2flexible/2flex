import {
    forwardRef,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import { type CSSProperties, type ReactNode, type Ref } from 'react'
import { Canvas as CanvasCore } from '@2flexible/2flex'
import { type CanvasOptions } from '@2flexible/2flex'
import { CanvasContext } from './context'

export interface CanvasProps extends CanvasOptions {
    /**
     * The width of the canvas in pixels.
     */
    width?: number
    /**
     * The height of the canvas in pixels.
     */
    height?: number
    /**
     * The styles applied to the canvas element.
     */
    style?: CSSProperties
    /**
     * The class name applied to the canvas element.
     */
    className?: string
    /**
     * The id applied to the canvas element.
     */
    id?: string
    /**
     * The blocks rendered inside of the canvas.
     */
    children?: ReactNode
    /**
     * The function that is called when the canvas is ready.
     *
     * The canvas is passed to the function, it is the way to reach the parts
     * of the library that react does not cover.
     */
    onReady?: (canvas: CanvasCore) => void
}

/**
 * The surface the blocks are drawn on.
 *
 * The component owns a `canvas` element and the canvas of the library that
 * is bound to it. The blocks that are rendered inside of it are added to the
 * scene.
 *
 * ```tsx
 * <Canvas width={600} height={400}>
 *   <Rectangle x={0} y={0} width={40} height={40} backgroundColor="red" />
 * </Canvas>
 * ```
 */
export const Canvas = forwardRef<CanvasCore, CanvasProps>(function Canvas(
    {
        width = 600,
        height = 400,
        style,
        className,
        id,
        children,
        onReady,
        ...options
    },
    ref
) {
    const elementRef = useRef<HTMLCanvasElement | null>(null)
    const instanceRef = useRef<CanvasCore | null>(null)
    const [canvas, setCanvas] = useState<CanvasCore | null>(null)
    // the options are read once, when the canvas is created
    const optionsRef = useRef<CanvasOptions>(options)

    useLayoutEffect(() => {
        const element = elementRef.current
        if (!element) return
        const instance = CanvasCore.fromElement(element, width, height, {
            ...optionsRef.current,
        })
        instanceRef.current = instance
        setCanvas(instance)
        onReady?.(instance)

        if (typeof ref === 'function') ref(instance)
        else if (ref) ref.current = instance

        return () => {
            // the element belongs to react, the canvas releases only its
            // render loop and its listeners
            instance.destroy()
            instanceRef.current = null
            setCanvas(null)
            if (typeof ref === 'function') ref(null)
            else if (ref) ref.current = null
        }
        // the canvas is created once, the size is handled by the effect below
    }, [])

    // the canvas follows the size of the component
    useEffect(() => {
        instanceRef.current?.resize(width, height)
    }, [width, height])

    return (
        <CanvasContext.Provider value={canvas}>
            <canvas
                ref={elementRef}
                id={id}
                className={className}
                style={style}
            >
                {children}
            </canvas>
        </CanvasContext.Provider>
    )
})

Canvas.displayName = 'Canvas'

/**
 * Returns the canvas the component is rendered in.
 *
 * It throws when it is used outside of a `Canvas` component.
 */
export function useCanvas(): CanvasCore {
    const canvas = useContext(CanvasContext)
    if (!canvas)
        throw new Error(
            '[2flex] useCanvas() must be used inside of a <Canvas> component.'
        )
    return canvas
}
