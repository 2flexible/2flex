/**
 * The video.
 *
 * A video is played onto the canvas. The source is a video element, so the
 * video is controlled by the element and not by the block.
 */
import { Canvas, VideoBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// the element that holds the video
const video = document.createElement('video')
video.src =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
video.loop = true
video.muted = true
video.playsInline = true
video.crossOrigin = 'anonymous'

const block = new VideoBlock({
    x: 20,
    y: 20,
    width: 320,
    height: 240,
    source: video,
    objectFit: 'cover',
    // the video starts to play as soon as it is on the canvas
    autoPlay: true,
    onPlay: (timestamp) => {
        console.log('the video is playing at', timestamp)
    },
})

initCanvas.add(block)

// the element can be controlled like any other video element
setTimeout(() => {
    void video.play()
}, 500)
