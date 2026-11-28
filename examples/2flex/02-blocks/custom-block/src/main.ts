/**
 * A block of your own.
 *
 * A block is a class that extends `Block`. An option is a method that holds
 * the value, and the helper `__valueHandler` keeps the cache of the value,
 * resolves the units and returns the resolved value.
 *
 * The helper `extendBlock` gives the class the typed options of the block,
 * so the options of the block are known by the code that uses it.
 */
import { Block, Canvas, extendBlock, type BlockOptions } from '@2flexible/2flex'

/**
 * The options of the progress bar.
 */
interface ProgressBlockOptions extends BlockOptions {
    /**
     * How far the task has come, from `0` to `1`.
     */
    progress?: number
    /**
     * The colour of the filled part of the bar.
     */
    progressColor?: string
}

/**
 * A bar that shows how far a task has come.
 *
 * The helper `extendBlock` gives the class the typed accessors of the
 * options of the block, so the options are known by the code that uses it.
 */
const ProgressBlock = extendBlock<ProgressBlockOptions>()(
    class ProgressBlock<
        T extends ProgressBlockOptions = ProgressBlockOptions,
    > extends Block<T> {
        /**
         * How far the task has come, from `0` to `1`.
         */
        progress(value?: number) {
            return super.__valueHandler(value, 'progress', 0)
        }

        /**
         * The colour of the filled part of the bar.
         */
        progressColor(value?: string) {
            return super.__valueHandler(value, 'progressColor', '#22c55e')
        }

        render() {
            super.render()

            const context = this.context
            if (!context) return

            const width = this.realWidth
            const height = this.realHeight
            const ratio = Math.min(1, Math.max(0, this.progress()))

            context.fillStyle = 'rgba(0, 0, 0, 0.35)'
            context.fillRect(0, 0, width, height)

            context.fillStyle = this.progressColor()
            context.fillRect(0, 0, width * ratio, height)
        }
    }
)

const initCanvas = new Canvas('canvas', 600, 400)

const bar = new ProgressBlock({
    x: 40,
    y: 80,
    width: 300,
    height: 24,
    progress: 0.65,
})

initCanvas.add(bar)

// the options of the block are read and written like the options of every
// other block
console.log(bar.progress(), bar.progressColor())
bar.progress(0.9)

// a block of a custom class is registered on the canvas, so a saved scene can
// be restored later
initCanvas.registerBlocks(ProgressBlock)
