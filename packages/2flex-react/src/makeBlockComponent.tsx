import {
    forwardRef,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import { type BaseBlock } from '@2flexible/2flex'
import { CanvasContext, ParentBlockContext } from './context'
import { BLOCK_EVENTS, diffOptions, toKnownOptions, toOptions } from './options'
import { type BlockComponentProps } from './options'
import {
    type BlockComponent,
    type BlockComponentPropsOf,
    type BlockConstructor,
} from './types'

export type {
    BlockComponent,
    BlockComponentPropsOf,
    BlockConstructor,
} from './types'

/**
 * Creates a component of a block.
 *
 * The props of the component are the options of the block, they are written
 * onto the block whenever they change.
 *
 * ```tsx
 * const Progress = makeBlockComponent(ProgressBlock)
 *
 * <Progress progress={0.5} progressColor="#22c55e" />
 * ```
 *
 * @param BlockClass - The class of the block.
 * @param displayName - The name of the component, it is the name of the class
 * when it is not given.
 */
export function makeBlockComponent<T extends BaseBlock = BaseBlock>(
    BlockClass: BlockConstructor<T>,
    displayName?: string
): BlockComponent<T> {
    const name = displayName ?? BlockClass.name

    const Component = forwardRef<T, BlockComponentPropsOf<T>>(
        function BlockComponent(props, ref) {
            const canvas = useContext(CanvasContext)
            const parent = useContext(ParentBlockContext)
            const blockRef = useRef<T | null>(null)
            // the options that were written onto the block, they are
            // compared with the options of the next render
            const appliedRef = useRef<Record<string, unknown>>({})
            // the handlers of the events, they are called by the handlers
            // that were registered on the block
            const handlersRef = useRef<Record<string, EventListener>>({})
            // the block is given to the children, it only exists after the
            // mount effect has run
            const [block, setBlock] = useState<T | null>(null)

            useLayoutEffect(() => {
                if (!canvas) return
                const given = toOptions(props as Record<string, unknown>)
                const instance = new BlockClass({} as never)
                // the block knows its own options, a prop that is not one
                // of them is dropped
                const options = toKnownOptions(instance, given)
                appliedRef.current = options
                blockRef.current = instance
                if (Object.keys(options).length > 0) instance.set(options)

                if (parent) parent.addChild(instance)
                else canvas.add(instance)
                // the canvas applies the queued changes in its render loop,
                // the flush applies them right away
                canvas.flush()
                setBlock(instance)

                // the handlers are registered once, they call the handler of
                // the prop of the moment
                for (const [prop, event] of Object.entries(BLOCK_EVENTS)) {
                    const handler = (props as Record<string, unknown>)[prop]
                    if (typeof handler !== 'function') continue
                    handlersRef.current[prop] = handler as EventListener
                    const method = (
                        instance as unknown as Record<
                            string,
                            (func: EventListener) => void
                        >
                    )[event]
                    if (typeof method !== 'function') continue
                    method.call(instance, (domEvent: Event) => {
                        handlersRef.current[prop]?.(domEvent)
                    })
                }

                if (typeof ref === 'function') ref(instance)
                else if (ref) ref.current = instance

                return () => {
                    if (parent) parent.removeChild(instance)
                    else canvas.remove(instance)
                    blockRef.current = null
                    setBlock(null)
                    handlersRef.current = {}
                    if (typeof ref === 'function') ref(null)
                    else if (ref) ref.current = null
                }
                // the block is created once, the props are synced below
            }, [canvas, parent])

            // the props that changed are written onto the block
            useEffect(() => {
                const instance = blockRef.current
                if (!instance) return
                // the handler of the prop of the moment is kept up to date
                for (const prop of Object.keys(BLOCK_EVENTS)) {
                    const handler = (props as Record<string, unknown>)[prop]
                    if (typeof handler !== 'function') {
                        delete handlersRef.current[prop]
                        continue
                    }
                    handlersRef.current[prop] = handler as EventListener
                }
                const next = toKnownOptions(
                    instance,
                    toOptions(props as Record<string, unknown>)
                )
                const changed = diffOptions(appliedRef.current, next)
                appliedRef.current = next
                if (Object.keys(changed).length === 0) return
                instance.set(changed)
            })

            return (
                <ParentBlockContext.Provider value={block}>
                    {(props as BlockComponentProps).children}
                </ParentBlockContext.Provider>
            )
        }
    )

    Component.displayName = name
    return Component as unknown as BlockComponent<T>
}
