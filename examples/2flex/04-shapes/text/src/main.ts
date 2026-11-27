/**
 * The text.
 *
 * A text block measures its glyphs, so it takes the size it needs when no
 * size is given. The text can be wrapped at the edge of the block, and it
 * can be edited on the canvas.
 */
import { Canvas, TextBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// a text that takes the size of its glyphs
const plain = new TextBlock({
    x: 20,
    y: 20,
    text: 'The text takes the size of its glyphs.',
    color: 'white',
    fontSize: 18,
})

// a text with a font of its own
const styled = new TextBlock({
    x: 20,
    y: 70,
    text: 'Bold and italic.',
    color: '#3b82f6',
    fontSize: 22,
    fontFamily: 'Georgia, serif',
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontVariant: 'small-caps',
})

// a text with an outline around the glyphs
const outlined = new TextBlock({
    x: 20,
    y: 120,
    text: 'An outlined text.',
    color: '#111827',
    strokeColor: '#22c55e',
    strokeWidth: 1,
    fontSize: 22,
})

// a text that is wrapped at the edge of the block
const wrapped = new TextBlock({
    x: 20,
    y: 170,
    width: 260,
    text: 'A long text that is wrapped at the edge of the block, so it takes more than one line.',
    color: '#9ca3af',
    fontSize: 16,
    wrap: 'word',
    lineHeight: 1.5,
})

// a text that can be edited on the canvas, a double click starts the editing
const editable = new TextBlock({
    x: 20,
    y: 260,
    width: 300,
    text: 'Double click to edit this text.',
    color: '#eab308',
    fontSize: 16,
    editable: true,
    onEditable: (block) => {
        console.log('the text is now', block.text())
    },
})

initCanvas.add(plain, styled, outlined, wrapped, editable)
