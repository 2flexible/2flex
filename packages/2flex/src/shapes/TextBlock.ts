import { SELECTABLE_RUNNING_EVENT } from '../const'
import { ShapeBlock } from '../ShapeBlock'
import type {
    DrawFunc,
    FontStyle,
    FontVariant,
    FontWeight,
    IShapeOptions,
} from '../ShapeBlock'
import type { CustomEvent, RelativeType } from '../types'
import { inRange } from '../Utils'

type Wrap = 'letter' | 'word' | 'nowrap'

export interface ITextOptions extends IShapeOptions {
    text?: string
    color?: string
    strokeWidth?: number
    strokeColor?: string
    fontFamily?: string
    fontSize?: RelativeType
    fontWeight?: FontWeight
    fontStyle?: FontStyle
    fontVariant?: FontVariant
    editable?: boolean
    wrap?: Wrap
    onEditable?: (block: TextBlock) => void
}
type WalkFunc = (letterNode: LetterNode) => void

const TEXT_EDITING_RUNNING_EVENT = 'text-editing'
const TEXT_HIGHLIGHT_COLOR = 'rgba(0, 13, 255, 0.47)'
const CARET_LINE_HEIGHT_GAP = 10
const CARET_LINE_COLOR = 'white'
const CARET_LINE_WIDTH = 2

class LetterNode {
    prev?: LetterNode
    next?: LetterNode
    letter?: string
    x: number
    y: number
    width: number
    height: number
    constructor(letter: string) {
        this.x = 0
        this.y = 0
        this.width = 0
        this.height = 0
        this.letter = letter
    }
}

export class TextBlock extends ShapeBlock {
    #headLetterNode?: LetterNode
    #tailLetterNode?: LetterNode
    #currentLetterNode?: LetterNode

    #words?: {
        [key: string]: { width: number; height: number }
    }

    #dbClickEvent?: CustomEvent<Event>
    #mousedownEvent?: CustomEvent<Event>
    #keydownEvent?: CustomEvent<Event>

    #textHighlighted: boolean

    constructor(options: ITextOptions) {
        super(options)
        this.#defineProperties()
        this.#textHighlighted = false
    }

    #defineProperties() {
        this.addProperty('fontFamily', 'sans-serif')
        this.addProperty('fontSize', 0, true)
        this.addProperty('fontWeight', 'normal')
        this.addProperty('fontVariant', 'normal')
        this.addProperty('fontStyle', 'normal')
        this.addProperty(
            'color',
            undefined,
            false,
            (block: TextBlock, opt: string) => this.#color(block, opt)
        )
        this.addProperty(
            'strokeColor',
            undefined,
            false,
            (block: TextBlock, opt: string) => this.#strokeColor(block, opt)
        )
        this.addProperty(
            'strokeWidth',
            undefined,
            false,
            (block: TextBlock, opt: number) => this.#strokeWidth(block, opt)
        )
        this.addProperty('wrap', 'nowrap')
        this.addProperty('onEditable', undefined)
        this.addProperty(
            'editable',
            undefined,
            false,
            (block: TextBlock, opt: boolean) => this.#editable(block, opt)
        )
        this.addProperty('letterSpacing', 0)
        this.addProperty('lineHeight', 'auto')
    }

    render(): void {
        super.render()
        this.#handleRunningEditable()
    }

    #handleRunningEditable() {
        const isEditable = this.__isRunningEventActive(
            TEXT_EDITING_RUNNING_EVENT
        )
        this.hotLines(!isEditable)
        if (isEditable) this.__selectCursor('auto')
    }

    draw(_func?: DrawFunc): void {
        super.font(this.#formatedFont)
        this.#updateLetterNodeCordinates()
        this.#drawCaret()
        this.#drawTextHighlight()
        const color = this.color()
        const strokeColor = this.strokeColor()
        this.#walkLetterNodes((letterNode: LetterNode) => {
            if (color !== undefined) {
                super.fillText({
                    text: letterNode.letter,
                    x: letterNode.x,
                    y: letterNode.y,
                    maxWidth: letterNode.width,
                })
            }
            if (strokeColor !== undefined) {
                super.strokeText({
                    text: letterNode.letter,
                    x: letterNode.x,
                    y: letterNode.y,
                    maxWidth: letterNode.width,
                })
            }
        })
    }
    get #formatedFont() {
        return `${this.fontStyle()} ${this.fontVariant()} ${this.fontWeight()} ${this.fontSize()}px ${this.fontFamily()}`
    }
    updateCords(): void {
        super.updateCords()
        this.#updateBoundingBox()
    }
    #updateBoundingBox() {
        const minXs: number[] = []
        const minYs: number[] = []
        const maxXs: number[] = []
        const maxYs: number[] = []
        this.#walkLetterNodes((node: LetterNode) => {
            minXs.push(node.x)
            minYs.push(node.y - node.height)
            maxXs.push(node.x + node.width)
            maxYs.push(node.y + node.height)
        })
        const minXPoint = Math.min(...minXs)
        const maxXPoint = Math.max(...maxXs)
        const minYPoint = Math.min(...minYs)
        const maxYPoint = Math.max(...maxYs)
        this.boundingBox = {
            topLeft: { x: minXPoint, y: minYPoint },
            topRight: { x: maxXPoint, y: minYPoint },
            bottomLeft: { x: minXPoint, y: maxYPoint },
            bottomRight: { x: maxXPoint, y: maxYPoint },
        }
    }
    #color(block: TextBlock, opt: string) {
        if (opt !== undefined) {
            block.fillStyle(opt)
            block.fill({ stroke: true })
        }
    }
    #strokeColor(block: TextBlock, opt: string) {
        if (opt !== undefined) {
            block.strokeStyle(opt)
            block.stroke({ stroke: true })
        }
    }
    #strokeWidth(block: TextBlock, opt: number) {
        if (opt !== undefined) {
            block.lineWidth(opt)
        }
    }
    text(opt: string) {
        const text = this.__cacheOption(opt, 'text', undefined)
        if (text === undefined) return
        this.#words = undefined
        const splitedText = text.split('')
        for (let i = 0, len = splitedText.length; i < len; i++) {
            this.#addLetter(splitedText[i], this.#tailLetterNode)
        }
    }
    #addLetter(letter: string, tail?: LetterNode) {
        const current = new LetterNode(letter)
        const tailNode = tail ?? this.#tailLetterNode
        if (tailNode) {
            current.next = tailNode?.next
            tailNode.next = current
            current.prev = tailNode
        }
        if (!this.#headLetterNode) this.#headLetterNode = current
        if (!this.#tailLetterNode) this.#tailLetterNode = current
        if (this.#tailLetterNode === tail) {
            if (this.#tailLetterNode) this.#tailLetterNode.next = current
            this.#tailLetterNode = current
        }
    }
    #removeLetter(letterNode: LetterNode) {
        let head = this.#headLetterNode
        if (!head) return
        if (head === letterNode) {
            this.#headLetterNode = this.#headLetterNode?.next
            return
        }
        while (head.next && head !== letterNode) {
            head = head.next
        }
        const next_letter = head.next
        const previus_letter = head.prev
        if (next_letter) next_letter.prev = previus_letter
        if (previus_letter) previus_letter.next = next_letter
    }
    #buildWords() {
        if (this.#words !== undefined) return
        this.#words = {}
        const words = this.#words
        let word = ''
        this.#walkLetterNodes((letterNode) => {
            word += letterNode.letter
            if (
                (word !== ' ' && letterNode.letter === ' ') ||
                letterNode.next === undefined
            ) {
                const measure = this.measureText(word)
                words[word] = {
                    width: measure?.width ?? 0,
                    height: measure?.actualBoundingBoxAscent ?? 0,
                }
                word = ''
            }
        })
    }
    #walkLetterNodes(_func: WalkFunc) {
        let letterNode: undefined | LetterNode = this.#headLetterNode
        while (letterNode) {
            _func(letterNode)
            letterNode = letterNode.next
        }
    }
    #findLetterNode(statementFunc: (letterNode: LetterNode) => boolean) {
        let letterNode: undefined | LetterNode = this.#headLetterNode
        while (letterNode) {
            if (statementFunc(letterNode)) break
            letterNode = letterNode.next
        }
    }
    #updateLetterNodeCordinates() {
        const wrap = this.wrap()
        const width = this.width()
        const x = this.x()
        const y = this.y()
        this.#buildWords()
        const words = Object.entries(this.#words ?? {})
        let wordIdx = 0
        let currentWord = words[wordIdx]
        let xPos = x
        let yPos = y
        let wrapW = 0
        let wrapH = 0
        this.#walkLetterNodes((letter: LetterNode) => {
            if (!letter.letter) return
            const measure = this.measureText(letter.letter)
            letter.width = measure?.width ?? 0
            letter.height = measure?.actualBoundingBoxAscent ?? 0
            wrapW += letter.width
            if (wrapW >= width && (wrap === 'letter' || wrap === 'word')) {
                yPos += wrapH
                xPos = x
                wrapW = letter.width
            }
            if (letter.letter === ' ' && wrap === 'word') {
                wordIdx += 1
                currentWord = words[wordIdx]
                if (currentWord && wrapW + currentWord[1].width > width)
                    wrapW += currentWord[1].width
            }

            if (letter.height > wrapH) wrapH = letter.height
            letter.x = xPos
            letter.y = yPos + wrapH
            xPos += letter.width
        })
    }
    #checkLetterInBound(event: MouseEvent) {
        const { x, y } = this.canvas?.getCursorPosition(event)!
        let currentNode
        this.#findLetterNode((letterNode: LetterNode) => {
            const yInBound = inRange(
                y,
                letterNode.y - letterNode.height,
                letterNode.y
            )
            const inPrevNode =
                inRange(x, letterNode.x, letterNode.x + letterNode.width / 2) &&
                yInBound
            const inCurrentNode =
                inRange(
                    x,
                    letterNode.x + letterNode.width / 2,
                    letterNode.x + letterNode.width
                ) && yInBound
            if (inPrevNode) currentNode = letterNode.prev
            else if (inCurrentNode) currentNode = letterNode
            return inPrevNode || inCurrentNode
        })
        return currentNode
    }
    checkInBound(event: MouseEvent): boolean {
        if (this.__isRunningEventActive(SELECTABLE_RUNNING_EVENT))
            return super.checkInBound(event)
        return !!this.#checkLetterInBound(event)
    }
    #drawCaret() {
        const context = this.context
        if (
            !context ||
            !this.__isRunningEventActive(TEXT_EDITING_RUNNING_EVENT) ||
            this.#textHighlighted ||
            !this.#currentLetterNode
        )
            return

        const node = this.#currentLetterNode.next
        const y = (node?.y ?? 0) - (node?.height ?? 0) - CARET_LINE_HEIGHT_GAP
        const x = node?.x ?? 0
        // @TODO: if letter is ' ' it gives -0 for height
        const height = y + (node?.height ?? 0) + CARET_LINE_HEIGHT_GAP*2
        context.save()
        context.beginPath()
        context.moveTo(x, y)
        context.lineTo(x, height)
        context.strokeStyle = CARET_LINE_COLOR
        context.lineWidth = CARET_LINE_WIDTH
        context.stroke()
        context.restore()
    }
    #drawTextHighlight() {
        const context = this.context
        if (
            !context ||
            !this.__isRunningEventActive(TEXT_EDITING_RUNNING_EVENT) ||
            !this.#textHighlighted ||
            !this.#currentLetterNode
        )
            return
        const boundingBox = this.boundingBox
        const x = boundingBox.topLeft.x
        const y = boundingBox.topLeft.y
        const width = boundingBox.topRight.x - boundingBox.topLeft.x
        const height = boundingBox.bottomRight.y - boundingBox.topRight.y
        context.save()
        context.beginPath()
        context.fillStyle = TEXT_HIGHLIGHT_COLOR
        context.fillRect(x, y, width, height)
        context.restore()
    }
    #keyMappingBehaviors(key: string) {
        switch (key) {
            case 'Backspace':
                if (this.#textHighlighted) {
                    this.#headLetterNode = undefined
                    this.#tailLetterNode = undefined
                    return
                }
                if (this.#currentLetterNode)
                    this.#removeLetter(this.#currentLetterNode)
                this.#currentLetterNode = this.#currentLetterNode?.prev
                break
            case 'Tab':
                if (this.#textHighlighted) {
                    this.#addLetter('    ', this.#headLetterNode)
                    return
                }
                this.#addLetter('    ', this.#currentLetterNode)
                this.#currentLetterNode = this.#currentLetterNode?.next
                break
            default:
                if (this.#textHighlighted) {
                    this.#headLetterNode = undefined
                    this.#tailLetterNode = undefined
                    this.#addLetter(key)
                    this.#currentLetterNode = this.#tailLetterNode
                    this.#textHighlighted = false
                    return
                }
                this.#addLetter(key, this.#currentLetterNode)
                this.#currentLetterNode = this.#currentLetterNode?.next
                break
        }
    }
    #editable(block: TextBlock, opt: boolean) {
        if (opt === undefined) return
        if (!opt) {
            if (block.#mousedownEvent)
                block.__removeEvent('mousedown', block.#mousedownEvent)
            if (block.#dbClickEvent)
                block.__removeEvent('dblclick', block.#dbClickEvent)
            if (block.#keydownEvent)
                block.__removeEvent('keydown', block.#keydownEvent)
            block.__updateRunningEvent(TEXT_EDITING_RUNNING_EVENT, false)
            block.#dbClickEvent = undefined
            block.#mousedownEvent = undefined
            block.#keydownEvent = undefined
            return
        }
        if (
            !block.#dbClickEvent &&
            !block.#mousedownEvent &&
            !block.#keydownEvent
        ) {
            const dbClick = (event: MouseEvent) => {
                block.#currentLetterNode = block.#checkLetterInBound(event)
                if (!block.#currentLetterNode) return
                block.__registerZIndex()
                if (block.__ImFirst()) {
                    block.__updateRunningEvent(TEXT_EDITING_RUNNING_EVENT, true)
                    block.#textHighlighted = true
                    block.__invokeChange()
                }
            }
            const mousedown = (event: MouseEvent) => {
                if (block.__isRunningEventActive(TEXT_EDITING_RUNNING_EVENT)) {
                    block.#currentLetterNode = block.#checkLetterInBound(event)
                    block.#textHighlighted = false
                    if (!block.#currentLetterNode) {
                        block.__updateRunningEvent(
                            TEXT_EDITING_RUNNING_EVENT,
                            false
                        )
                        block.__resetCursor('auto')
                    }
                    block.__invokeChange()
                }
            }
            const keydown = (event: KeyboardEvent) => {
                if (block.__isRunningEventActive(TEXT_EDITING_RUNNING_EVENT)) {
                    event.preventDefault()
                    block.#keyMappingBehaviors(event.key)
                    block.onEditable()?.(block)
                    block.__invokeChange()
                }
            }
            block.__addEvent('dblclick', dbClick)
            block.__addEvent('mousedown', mousedown)
            block.__addEvent('keydown', keydown)
        }
    }
}
