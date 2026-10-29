import {
    initialCorners,
    SELECTABLE_RUNNING_EVENT,
    DRAGGABLE_RUNNING_EVENT,
} from '../const'
import { DummyCanvas } from '../DummyCanvas'
import { ShapeBlock } from '../ShapeBlock'
import type {
    DrawFunc,
    FontStyle,
    FontVariant,
    FontWeight,
    IShapeOptions,
} from '../ShapeBlock'
import type { CustomEvent, HotCornerArea, RelativeType } from '../types'
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
    lineHeight?: RelativeType
    editable?: boolean
    wrap?: Wrap
    onEditable?: (block: TextBlock) => void
    caret?: boolean
}
type WalkFunc = (letterNode: LetterNode) => void

const TEXT_EDITABLE_RUNNING_EVENT = 'text-editable'
const TEXT_EDITING_RUNNING_EVENT = 'text-editing'
const TEXT_HIGHLIGHT_COLOR = 'rgba(0, 13, 255, 0.47)'
const CARET_LINE_HEIGHT_GAP = 10
const CARET_LINE_COLOR = 'white'
const CARET_LINE_WIDTH = 2
const CARET_HOLD_DURATION = 500

class LetterNode {
    prev?: LetterNode
    next?: LetterNode
    letter?: string
    x: number
    y: number
    width: number
    height: number
    descent: number
    line: number
    constructor(letter: string) {
        this.x = 0
        this.y = 0
        this.width = 0
        this.height = 0
        this.descent = 0
        this.line = 0
        this.letter = letter
    }
}

export class TextBlock extends ShapeBlock {
    #headLetterNode?: LetterNode
    #tailLetterNode?: LetterNode
    #selectionAnchor?: LetterNode
    #selectionFocus?: LetterNode

    #words?: {
        [key: string]: { width: number; height: number }
    }
    #wordsFontKey?: string

    #dbClickEvent?: CustomEvent<Event>
    #mousedownEvent?: CustomEvent<Event>
    #mouseMoveEvent?: CustomEvent<Event>
    #mouseUpEvent?: CustomEvent<Event>
    #keydownEvent?: CustomEvent<Event>

    #isDraggingSelection: boolean = false

    #dummyContext?: OffscreenCanvasRenderingContext2D | null
    #localBoundingBox: HotCornerArea

    #caretAnimationId?: string
    #caretAnimationRunning: boolean = false
    #lastInteractionAt: number = 0

    constructor(options: ITextOptions) {
        super(options)
        this.#defineProperties()
        this.#localBoundingBox = initialCorners
    }

    #defineProperties() {
        this.addProperty(
            'text',
            undefined,
            false,
            undefined,
            (block: TextBlock, val?: string) => {
                return block.#text(val)
            }
        )
        this.addProperty('fontFamily', 'sans-serif')
        this.addProperty('fontSize', 0, true)
        this.addProperty('fontWeight', 'normal')
        this.addProperty('fontVariant', 'normal')
        this.addProperty('fontStyle', 'normal')
        this.addProperty('color', undefined)
        this.addProperty('strokeColor', undefined)
        this.addProperty('strokeWidth', undefined)
        this.addProperty('wrap', 'nowrap')
        this.addProperty('onEditable', undefined)
        this.addProperty(
            'editable',
            undefined,
            false,
            (block: TextBlock, opt: boolean) => this.#editable(block, opt)
        )
        this.addProperty('letterSpacing', 0)
        this.addProperty(
            'lineHeight',
            0,
            false,
            undefined,
            (block: TextBlock, val?: RelativeType) =>
                block.#parseLineHeight(val)
        )
        this.addProperty('caret', true)
    }

    render(): void {
        this.#handleRunningEditable()
        super.render()
    }

    #handleRunningEditable() {
        const isEditable = this.__isRunningEventActive(
            TEXT_EDITABLE_RUNNING_EVENT
        )
        this.hotLines(!isEditable)
        if (isEditable) this.__selectCursor('auto')
        this.#handleCaretAnimation(isEditable)
    }

    #handleCaretAnimation(editable?: boolean) {
        this.#addCaretAnimation()
        const animationId = this.#caretAnimationId
        if (!animationId) return

        if (!!editable !== this.#caretAnimationRunning) {
            if (editable) this.animationStart(animationId)
            else this.animationStop(animationId)
            this.#caretAnimationRunning = !!editable
        }
        if (this.#caretAnimationRunning) this.#holdCaretVisible()
    }
    #holdCaretVisible() {
        if (
            this.__isRunningEventActive(TEXT_EDITING_RUNNING_EVENT) &&
            performance.now() - this.#lastInteractionAt >= CARET_HOLD_DURATION
        )
            this.__updateRunningEvent(TEXT_EDITING_RUNNING_EVENT, false)
        if (
            this.__isRunningEventActive(TEXT_EDITING_RUNNING_EVENT) &&
            !this.caret()
        )
            this.caret(true)
    }
    #markEditing() {
        this.__updateRunningEvent(TEXT_EDITING_RUNNING_EVENT, true)
        this.#lastInteractionAt = performance.now()
    }
    #clearEditing() {
        this.__updateRunningEvent(TEXT_EDITING_RUNNING_EVENT, false)
    }
    #addCaretAnimation() {
        if (this.#caretAnimationId) return
        this.#caretAnimationId = this.animate({
            caret: [true, false],
            duration: 1000,
            iterations: Infinity,
            autoStart: false,
        } as any)
        this.#caretAnimationRunning = false
    }

    draw(_func?: DrawFunc): void {
        this.#setFont()
        this.#buildWords()
        this.#updateLetterNodeCordinates()
        const caret = this.getOptionCurrent('caret')
        if (caret) this.#drawCaret()
        this.#drawTextHighlight()
        const context = this.context
        const color = this.color()
        const strokeColor = this.strokeColor()
        const hasFill = color !== undefined && !!context
        const hasStroke = strokeColor !== undefined && !!context
        if (hasFill && context) context.fillStyle = color
        if (hasStroke && context) {
            context.strokeStyle = strokeColor
            context.lineWidth = this.strokeWidth() ?? 0
        }
        this.#walkLetterNodes((letterNode: LetterNode) => {
            if (hasFill && context) {
                context.fillText(
                    letterNode.letter!,
                    letterNode.x,
                    letterNode.y,
                    letterNode.width
                )
            }
            if (hasStroke && context) {
                context.strokeText(
                    letterNode.letter!,
                    letterNode.x,
                    letterNode.y,
                    letterNode.width
                )
            }
        })
    }
    get #formatedFont() {
        return `${this.fontStyle()} ${this.fontVariant()} ${this.fontWeight()} ${this.fontSize()}px ${this.fontFamily()}`
    }
    get #lineHeightPx() {
        return (this.fontSize() || 0) * (this.lineHeight() ?? 1)
    }
    #parseLineHeight(val?: RelativeType): number | undefined {
        if (val === undefined) return undefined
        if (typeof val === 'number')
            return Number.isFinite(val) ? val : undefined
        const trimmed = String(val).trim()
        if (trimmed === '') return undefined
        if (trimmed.endsWith('%')) {
            const num = Number(trimmed.slice(0, -1))
            return Number.isFinite(num) ? num / 100 : undefined
        }
        const num = Number(trimmed)
        return Number.isFinite(num) ? num : undefined
    }
    get #activeContext() {
        return this.context || this.#dummyContext
    }
    init(): void {
        this.#constructDummyContext()
        super.init()
        this.#setFont()
        this.#buildWords()
        this.#updateLetterNodeCordinates()
        this.#updateBoundingCords()
        this.#addCaretAnimation()
    }
    #constructDummyContext() {
        const dummyCanvas = new DummyCanvas(this.width(), this.height())
        this.#dummyContext = dummyCanvas.context
    }
    measureText(text: string) {
        const context = this.#activeContext
        return context?.measureText(text)
    }
    updateCords(): void {
        super.updateCords()
        this.#updateBoundingCords()
    }
    #setFont() {
        const context = this.#activeContext
        if (!context) return
        context.font = this.#formatedFont
    }
    #updateBoundingCords() {
        this.#setFont()
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

        if (minXs.length === 0) {
            this.#localBoundingBox = initialCorners
            this.boundingBox = initialCorners
            return
        }

        const minX = Math.min(...minXs)
        const maxX = Math.max(...maxXs)
        const minY = Math.min(...minYs)
        const maxY = Math.max(...maxYs)

        this.#localBoundingBox = {
            topLeft: { x: minX, y: minY },
            topRight: { x: maxX, y: minY },
            bottomLeft: { x: minX, y: maxY },
            bottomRight: { x: maxX, y: maxY },
        }

        const realTopLeftCord = this.#localToRealCords(minX, minY)
        const realTopRightCord = this.#localToRealCords(maxX, minY)
        const realBottomLeftCord = this.#localToRealCords(minX, maxY)
        const realBottomRightCord = this.#localToRealCords(maxX, maxY)
        const xs = [
            realTopLeftCord.x,
            realTopRightCord.x,
            realBottomLeftCord.x,
            realBottomRightCord.x,
        ]
        const ys = [
            realTopLeftCord.y,
            realTopRightCord.y,
            realBottomLeftCord.y,
            realBottomRightCord.y,
        ]

        const worldMinX = Math.min(...xs)
        const worldMaxX = Math.max(...xs)
        const worldMinY = Math.min(...ys)
        const worldMaxY = Math.max(...ys)

        this.boundingBox = {
            topLeft: { x: worldMinX, y: worldMinY },
            topRight: { x: worldMaxX, y: worldMinY },
            bottomLeft: { x: worldMinX, y: worldMaxY },
            bottomRight: { x: worldMaxX, y: worldMaxY },
        }
    }
    #localToRealCords(x: number, y: number) {
        const verticalFlip = this.verticalFlip()
        const horizontalFlip = this.horizontalFlip()
        const fx = horizontalFlip ? -1 : 1
        const fy = verticalFlip ? -1 : 1
        const rotate = this.rotate() || 0
        const rotSign = verticalFlip !== horizontalFlip ? -1 : 1
        const centerX = this.rotationCenterX()
        const centerY = this.rotationCenterY()
        const angle = rotate * rotSign
        const cosA = Math.cos(angle)
        const sinA = Math.sin(angle)
        const wx = x - centerX
        const wy = y - centerY
        const rx = wx * cosA - wy * sinA
        const ry = wx * sinA + wy * cosA
        return { x: rx * fx + centerX, y: ry * fy + centerY }
    }
    #text(text?: string) {
        if (text === undefined) return text
        this.#invalidateWords()
        this.#headLetterNode = undefined
        this.#tailLetterNode = undefined
        for (const letter of text.split(''))
            this.#insertLetter(letter, this.#tailLetterNode)
        this.#selectionFocus = this.#tailLetterNode
        this.#selectionAnchor = this.#tailLetterNode
        return text
    }
    #invalidateWords() {
        this.#words = undefined
        this.#wordsFontKey = undefined
    }
    #insertLetter(letter: string, after?: LetterNode): LetterNode {
        const node = new LetterNode(letter)
        if (after) {
            node.next = after.next
            node.prev = after
            if (after.next) after.next.prev = node
            after.next = node
            if (this.#tailLetterNode === after) this.#tailLetterNode = node
        } else {
            node.next = this.#headLetterNode
            if (this.#headLetterNode) this.#headLetterNode.prev = node
            this.#headLetterNode = node
            if (!this.#tailLetterNode) this.#tailLetterNode = node
        }
        this.#invalidateWords()
        return node
    }
    #removeLetter(letterNode: LetterNode) {
        const previous = letterNode.prev
        const next = letterNode.next
        if (previous) previous.next = next
        else this.#headLetterNode = next
        if (next) next.prev = previous
        else this.#tailLetterNode = previous
        letterNode.prev = undefined
        letterNode.next = undefined
        this.#invalidateWords()
    }
    #buildWords() {
        const letterSpacing = this.letterSpacing() ?? 0
        const fontKey = `${this.#formatedFont}|${letterSpacing}`
        if (this.#words !== undefined && this.#wordsFontKey === fontKey) return
        this.#words = {}
        this.#wordsFontKey = fontKey
        const words = this.#words
        const lineHeightPx = this.#lineHeightPx
        let word = ''
        this.#walkLetterNodes((letterNode) => {
            word += letterNode.letter
            if (
                (word !== ' ' && letterNode.letter === ' ') ||
                letterNode.next === undefined
            ) {
                const measure = this.measureText(word)
                const wordWidth =
                    (measure?.width ?? 0) + word.length * letterSpacing
                const wordHeight =
                    (measure?.actualBoundingBoxAscent ||
                        measure?.fontBoundingBoxAscent ||
                        0) + lineHeightPx
                words[word] = {
                    width: wordWidth,
                    height: wordHeight,
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
        const height = this.height()
        const absoluteWidth = Math.abs(width)
        const x = this.x()
        const y = this.y()
        const letterSpacing = this.letterSpacing() ?? 0
        const lineHeightPx = this.#lineHeightPx
        const addW = this.horizontalFlip() ? width : 0
        const addH = this.verticalFlip() ? height : 0
        const words = Object.entries(this.#words ?? {})
        let wordIdx = 0
        let currentWord = words[wordIdx]
        let xPos = x
        let yPos = y
        let wrapW = 0
        let wrapH = 0
        let node: LetterNode | undefined = this.#headLetterNode
        while (node) {
            const letter = node
            node = node.next
            if (!letter.letter) continue
            const measure = this.measureText(letter.letter)
            letter.width = (measure?.width ?? 0) + letterSpacing
            letter.height =
                measure?.actualBoundingBoxAscent ||
                measure?.fontBoundingBoxAscent ||
                0
            letter.descent =
                measure?.actualBoundingBoxDescent ||
                measure?.fontBoundingBoxDescent ||
                0
            wrapW += letter.width
            if (
                wrapW >= absoluteWidth &&
                (wrap === 'letter' || wrap === 'word')
            ) {
                yPos += wrapH
                xPos = x
                wrapW = letter.width
            }
            if (letter.letter === ' ' && wrap === 'word') {
                wordIdx += 1
                currentWord = words[wordIdx]
                if (currentWord && wrapW + currentWord[1].width > absoluteWidth)
                    wrapW += currentWord[1].width
            }
            if (letter.height > wrapH && letter.letter !== ' ')
                wrapH = letter.height + lineHeightPx
            letter.x = xPos + addW
            letter.y = yPos + wrapH + addH
            xPos += letter.width
        }
    }
    #checkLetterInBound(event: MouseEvent) {
        let { x, y } = this.canvas?.getCursorPosition(event)!
        const rotate = this.rotate() || 0
        const verticalFlip = this.verticalFlip()
        const horizontalFlip = this.horizontalFlip()
        const centerX = this.rotationCenterX()
        const centerY = this.rotationCenterY()

        if (horizontalFlip) x = 2 * centerX - x
        if (verticalFlip) y = 2 * centerY - y
        if (rotate !== 0) {
            const rotSign = verticalFlip !== horizontalFlip ? -1 : 1
            const inv = this.__rotateCordiantesByCenter(x, y, -rotate * rotSign)
            x = inv.x
            y = inv.y
        }
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
        this.#setFont()
        const context = this.context
        const focus = this.#selectionFocus
        if (
            !context ||
            !this.__isRunningEventActive(TEXT_EDITABLE_RUNNING_EVENT) ||
            this.#hasSelection() ||
            !focus
        )
            return

        const node = focus.next
        const ascent = node?.height || focus.height || 0
        const y = (node?.y ?? focus.y) - ascent - CARET_LINE_HEIGHT_GAP
        const x = node?.x ?? focus.x + focus.width
        const height = y + ascent + CARET_LINE_HEIGHT_GAP * 2
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
            !this.__isRunningEventActive(TEXT_EDITABLE_RUNNING_EVENT) ||
            !this.#hasSelection()
        )
            return
        const range = this.#selectionRange()
        if (!range) return
        const minXs: number[] = []
        const minYs: number[] = []
        const maxXs: number[] = []
        const maxYs: number[] = []
        let node: LetterNode | undefined = range.start
        while (node) {
            minXs.push(node.x)
            minYs.push(node.y - node.height)
            maxXs.push(node.x + node.width)
            maxYs.push(node.y + node.height)
            if (node === range.end) break
            node = node.next
        }
        if (minXs.length === 0) return
        const x = Math.min(...minXs)
        const y = Math.min(...minYs)
        const width = Math.max(...maxXs) - x
        const height = Math.max(...maxYs) - y
        context.save()
        context.beginPath()
        context.fillStyle = TEXT_HIGHLIGHT_COLOR
        context.fillRect(x, y, width, height)
        context.restore()
    }
    #hasSelection(): boolean {
        return (
            this.#selectionAnchor !== undefined &&
            this.#selectionFocus !== undefined &&
            this.#selectionAnchor !== this.#selectionFocus
        )
    }
    #selectionRange(): { start: LetterNode; end: LetterNode } | undefined {
        if (!this.#selectionAnchor || !this.#selectionFocus) return undefined
        if (this.#selectionAnchor === this.#selectionFocus) return undefined
        const a = this.#selectionAnchor
        const b = this.#selectionFocus
        let start: LetterNode | undefined = a
        let end: LetterNode | undefined = b
        let cur: LetterNode | undefined = a
        while (cur) {
            if (cur === b) {
                start = a
                end = b
                break
            }
            cur = cur.next
            if (cur === a) break
        }
        if (cur !== b) {
            start = b
            end = a
        }
        return { start, end }
    }
    #setCaret(node: LetterNode | undefined) {
        this.#selectionFocus = node
        this.#selectionAnchor = node
    }
    #moveCaret(direction: 'prev' | 'next') {
        const focus = this.#selectionFocus
        if (!focus) return
        this.#setCaret(direction === 'prev' ? focus.prev : focus.next)
    }
    #extendSelection(direction: 'prev' | 'next') {
        const focus = this.#selectionFocus
        if (!focus) return
        this.#selectionFocus = direction === 'prev' ? focus.prev : focus.next
    }
    #currentY(): number | undefined {
        return this.#selectionFocus?.y
    }
    #currentX(): number {
        const focus = this.#selectionFocus
        if (!focus) return 0
        return focus.x + focus.width / 2
    }
    #moveCaretVertically(direction: 'up' | 'down') {
        const focus = this.#selectionFocus
        if (!focus) return
        const currentY = focus.y
        const currentX = this.#currentX()
        let best: LetterNode | undefined
        let bestDist = Infinity
        let node: LetterNode | undefined = this.#headLetterNode
        while (node) {
            if (
                node !== focus &&
                (direction === 'down' ? node.y > currentY : node.y < currentY)
            ) {
                const dist =
                    Math.abs(node.y - currentY) + Math.abs(node.x - currentX)
                if (dist < bestDist) {
                    bestDist = dist
                    best = node
                }
            }
            node = node.next
        }
        if (best) this.#setCaret(best)
    }
    #moveCaretToLineEdge(edge: 'start' | 'end') {
        const focus = this.#selectionFocus
        if (!focus) return
        const y = focus.y
        const target: 'prev' | 'next' = edge === 'start' ? 'prev' : 'next'
        let node: LetterNode | undefined = focus
        while (node && node[target] && node[target]?.y === y) {
            node = node[target]
        }
        this.#setCaret(node)
    }
    #extendSelectionVertically(direction: 'up' | 'down') {
        const focus = this.#selectionFocus
        if (!focus) return
        const currentY = focus.y
        const currentX = this.#currentX()
        let best: LetterNode | undefined
        let bestDist = Infinity
        let node: LetterNode | undefined = this.#headLetterNode
        while (node) {
            if (
                node !== focus &&
                (direction === 'down' ? node.y > currentY : node.y < currentY)
            ) {
                const dist =
                    Math.abs(node.y - currentY) + Math.abs(node.x - currentX)
                if (dist < bestDist) {
                    bestDist = dist
                    best = node
                }
            }
            node = node.next
        }
        if (best) this.#selectionFocus = best
    }
    #extendSelectionToLineEdge(edge: 'start' | 'end') {
        const focus = this.#selectionFocus
        if (!focus) return
        const y = focus.y
        const target: 'prev' | 'next' = edge === 'start' ? 'prev' : 'next'
        let node: LetterNode | undefined = focus
        while (node && node[target] && node[target]?.y === y) {
            node = node[target]
        }
        this.#selectionFocus = node
    }
    #selectAll() {
        this.#selectionAnchor = this.#headLetterNode
        this.#selectionFocus = this.#tailLetterNode
    }
    #deleteRange() {
        const range = this.#selectionRange()
        if (!range) return
        const letters: LetterNode[] = []
        let node: LetterNode | undefined = range.start
        while (node) {
            letters.push(node)
            if (node === range.end) break
            node = node.next
        }
        const caret = range.start.prev
        for (const letter of letters) this.#removeLetter(letter)
        this.#setCaret(caret)
    }
    #selectionText(): string {
        const range = this.#selectionRange()
        if (!range) return ''
        let out = ''
        let node: LetterNode | undefined = range.start
        while (node) {
            out += node.letter ?? ''
            if (node === range.end) break
            node = node.next
        }
        return out
    }
    #insertText(text: string) {
        if (this.#hasSelection()) this.#deleteRange()
        if (text === '') return
        let after: LetterNode | undefined = this.#selectionFocus
        for (const letter of text.split(''))
            after = this.#insertLetter(letter, after)
        this.#selectionFocus = after
        this.#selectionAnchor = after
    }
    #handleBackspace() {
        if (this.#hasSelection()) {
            this.#deleteRange()
            return
        }
        const focus = this.#selectionFocus
        if (!focus) return
        const previous = focus.prev
        this.#removeLetter(focus)
        this.#setCaret(previous)
    }
    #handleDelete() {
        if (this.#hasSelection()) {
            this.#deleteRange()
            return
        }
        const focus = this.#selectionFocus
        if (!focus) return
        const target = focus.next
        if (!target) return
        this.#removeLetter(target)
        this.#setCaret(focus)
    }
    #copySelection() {
        const text = this.#selectionText()
        if (text === '') return
        navigator.clipboard?.writeText(text)
    }
    #cutSelection() {
        const text = this.#selectionText()
        if (text === '') return
        navigator.clipboard?.writeText(text)
        this.#deleteRange()
    }
    #pasteFromClipboard() {
        navigator.clipboard?.readText().then((text) => {
            this.#insertText(text)
            this.onEditable()?.(this)
            this.__invokeChange()
        })
    }
    #keyMappingBehaviors(event: KeyboardEvent) {
        const key = event.key
        const mod = event.ctrlKey || event.metaKey
        const shift = event.shiftKey

        if (mod && (key === 'a' || key === 'A')) return this.#selectAll()
        if (mod && (key === 'c' || key === 'C')) return this.#copySelection()
        if (mod && (key === 'x' || key === 'X')) return this.#cutSelection()
        if (mod && (key === 'v' || key === 'V'))
            return this.#pasteFromClipboard()

        if (key === 'Backspace') return this.#handleBackspace()
        if (key === 'Delete') return this.#handleDelete()
        if (key === 'Enter') return this.#insertText('\n')
        if (key === 'Tab') return this.#insertText('    ')
        if (key === 'Escape') {
            this.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, false)
            this.__updateRunningEvent(DRAGGABLE_RUNNING_EVENT, false)
            this.#clearEditing()
            this.#selectionAnchor = undefined
            this.#selectionFocus = undefined
            this.__resetCursor('auto')
            return
        }

        if (!shift) {
            if (key === 'ArrowLeft') return this.#moveCaret('prev')
            if (key === 'ArrowRight') return this.#moveCaret('next')
            if (key === 'ArrowUp') return this.#moveCaretVertically('up')
            if (key === 'ArrowDown') return this.#moveCaretVertically('down')
            if (key === 'Home') return this.#setCaret(this.#headLetterNode)
            if (key === 'End') return this.#setCaret(this.#tailLetterNode)
            if (key === 'PageUp') return this.#setCaret(this.#headLetterNode)
            if (key === 'PageDown') return this.#setCaret(this.#tailLetterNode)
        } else {
            if (key === 'ArrowLeft') return this.#extendSelection('prev')
            if (key === 'ArrowRight') return this.#extendSelection('next')
            if (key === 'ArrowUp') return this.#extendSelectionVertically('up')
            if (key === 'ArrowDown')
                return this.#extendSelectionVertically('down')
            if (key === 'Home') {
                this.#selectionFocus = this.#headLetterNode
                return
            }
            if (key === 'End') {
                this.#selectionFocus = this.#tailLetterNode
                return
            }
            if (key === 'PageUp') {
                this.#selectionFocus = this.#headLetterNode
                return
            }
            if (key === 'PageDown') {
                this.#selectionFocus = this.#tailLetterNode
                return
            }
        }

        if (
            key.length === 1 &&
            !mod &&
            key !== 'Tab' &&
            key !== 'Enter' &&
            key !== 'Escape'
        )
            return this.#insertText(key)
    }
    #editable(block: TextBlock, opt: boolean) {
        if (opt === undefined) return
        if (!opt) {
            if (block.#mousedownEvent)
                block.__removeEvent('mousedown', block.#mousedownEvent)
            if (block.#mouseMoveEvent)
                block.__removeEvent('mousemove', block.#mouseMoveEvent)
            if (block.#mouseUpEvent)
                block.__removeEvent('mouseup', block.#mouseUpEvent)
            if (block.#dbClickEvent)
                block.__removeEvent('dblclick', block.#dbClickEvent)
            if (block.#keydownEvent)
                block.__removeEvent('keydown', block.#keydownEvent)
            block.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, false)
            block.__updateRunningEvent(DRAGGABLE_RUNNING_EVENT, false)
            block.#clearEditing()
            block.#isDraggingSelection = false
            block.__resetCursor('auto')
            block.#dbClickEvent = undefined
            block.#mousedownEvent = undefined
            block.#mouseMoveEvent = undefined
            block.#mouseUpEvent = undefined
            block.#keydownEvent = undefined
            return
        }
        if (
            !block.#dbClickEvent &&
            !block.#mousedownEvent &&
            !block.#mouseMoveEvent &&
            !block.#mouseUpEvent &&
            !block.#keydownEvent
        ) {
            const dbClick = (event: MouseEvent) => {
                const clicked = block.#checkLetterInBound(event)
                if (!clicked) return
                block.__registerZIndex()
                if (block.__ImFirst()) {
                    block.#isDraggingSelection = false
                    block.__updateRunningEvent(DRAGGABLE_RUNNING_EVENT, false)
                    block.__updateRunningEvent(
                        TEXT_EDITABLE_RUNNING_EVENT,
                        true
                    )
                    block.#selectionAnchor = block.#headLetterNode
                    block.#selectionFocus = block.#tailLetterNode
                    block.__invokeChange()
                }
            }
            const mousedown = (event: MouseEvent) => {
                if (block.__isRunningEventActive(TEXT_EDITABLE_RUNNING_EVENT)) {
                    block.__registerZIndex()
                    if (!block.__ImFirst()) return
                    event.preventDefault()
                    const clicked = block.#checkLetterInBound(event)
                    if (!clicked) {
                        block.__updateRunningEvent(
                            TEXT_EDITABLE_RUNNING_EVENT,
                            false
                        )
                        block.__updateRunningEvent(
                            DRAGGABLE_RUNNING_EVENT,
                            false
                        )
                        block.#clearEditing()
                        block.#selectionAnchor = undefined
                        block.#selectionFocus = undefined
                        block.#isDraggingSelection = false
                        block.__resetCursor('auto')
                        block.__invokeChange()
                        return
                    }
                    block.__updateRunningEvent(DRAGGABLE_RUNNING_EVENT, false)
                    if (event.shiftKey) {
                        if (block.#selectionAnchor === undefined) {
                            block.#selectionAnchor = clicked
                        }
                        block.#selectionFocus = clicked
                    } else {
                        block.#selectionAnchor = clicked
                        block.#selectionFocus = clicked
                    }
                    block.#isDraggingSelection = true
                    block.__selectCursor('text')
                    block.__invokeChange()
                }
            }
            const mousemove = (event: MouseEvent) => {
                if (
                    block.#isDraggingSelection &&
                    block.__isRunningEventActive(TEXT_EDITABLE_RUNNING_EVENT) &&
                    block.isMouseEventAllowed
                ) {
                    event.preventDefault()
                    block.__updateRunningEvent(DRAGGABLE_RUNNING_EVENT, false)
                    const clicked = block.#checkLetterInBound(event)
                    if (clicked) {
                        block.#selectionFocus = clicked
                    }
                    block.#markEditing()
                    block.__invokeChange()
                }
            }
            const mouseup = (event: MouseEvent) => {
                if (block.#isDraggingSelection) {
                    block.#isDraggingSelection = false
                    block.__updateRunningEvent(DRAGGABLE_RUNNING_EVENT, false)
                    block.__resetCursor('text')
                    if (
                        block.__isRunningEventActive(
                            TEXT_EDITABLE_RUNNING_EVENT
                        )
                    ) {
                        const clicked = block.#checkLetterInBound(event)
                        if (clicked) block.#selectionFocus = clicked
                        block.__invokeChange()
                        block.#markEditing()
                    }
                }
            }
            const keydown = (event: KeyboardEvent) => {
                if (block.__isRunningEventActive(TEXT_EDITABLE_RUNNING_EVENT)) {
                    event.preventDefault()
                    block.#keyMappingBehaviors(event)
                    block.onEditable()?.(block)
                    block.#markEditing()
                    block.__invokeChange()
                }
            }
            block.__addEvent('dblclick', dbClick)
            block.__addEvent('mousedown', mousedown)
            block.__addEvent('mousemove', mousemove)
            block.__addEvent('mouseup', mouseup)
            block.__addEvent('keydown', keydown)
            block.#dbClickEvent = dbClick as any
            block.#mousedownEvent = mousedown as any
            block.#mouseMoveEvent = mousemove as any
            block.#mouseUpEvent = mouseup as any
            block.#keydownEvent = keydown as any
        }
    }
}
