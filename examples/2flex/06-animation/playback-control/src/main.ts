/**
 * The control of an animation.
 *
 * An animation is played, stopped and reversed while the scene is running.
 * The id of the animation is returned by `animate`, and it is used for every
 * command of the playback.
 */
import { Canvas, RectangleBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

const block = new RectangleBlock({
    x: 40,
    y: 40,
    width: 100,
    height: 100,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
})

initCanvas.add(block)

// the id of the animation is used to control it
const animationId = block.animate({
    duration: 2000,
    easing: 'ease-in-out',
    iterations: Infinity,
    x: [40, 400, 40],
})

// the animation waits before it starts
block.animationDelay(animationId, 500)

// the animation is played at half the speed
block.animationPlaybackRate(animationId, 0.5)

// the animation is stopped after a second
setTimeout(() => {
    block.animationStop(animationId)
    console.log('the animation was stopped')
}, 1000)

// and it is played again after another second
setTimeout(() => {
    block.animationStart(animationId)
    console.log('the animation was started again')
}, 2000)

// the animation is reversed after another second
setTimeout(() => {
    block.animationReverse(animationId)
    console.log('the animation was reversed')
}, 3000)

// the animation is taken off the block after another second
setTimeout(() => {
    block.removeAnimation(animationId)
    console.log('the animation was removed')
}, 4000)
