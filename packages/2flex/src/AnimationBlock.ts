import { BaseBlock, IBaseBlockOptions } from './BaseBlock'
import type {
    Animator,
    BlockConstructor,
    CubicBezier,
    LinearEasing,
    RGBA,
    StepsEasing,
} from './types'
import {
    clamp,
    easingParser,
    getPrototype,
    lerp,
    rgbaRepresenter,
    rgbaToArray,
} from './Utils'

export type Easing =
    | 'linear'
    | 'ease'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'step-start'
    | 'step-end'
    | LinearEasing
    | CubicBezier
    | StepsEasing
export type Direction = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
export type Composite = 'replace' | 'add' | 'accumulate'
export type Delay = number
export type Iterations = number
export type Duration = number
export type IterationStart = number
export type PlaybackRate = number
export type AutoStart = boolean
export type IteratableOpts = { [K in keyof BaseBlock]: BaseBlock[K][] }

export interface KeyFrame {
    [key: string]: KeyFrame[keyof KeyFrame]
    id?: string
    autoStart?: AutoStart
    iterations?: Iterations
    delay?: Delay
    direction?: Direction
    duration?: Duration
    composite?: Composite
    easing?: Easing
    iterationStart?: IterationStart
    playbackRate?: PlaybackRate
    onFinish?: () => void
}

export type AnimationKeyframe = KeyFrame & IteratableOpts

interface KeyframesConfig {
    currentIdx?: number
    currentVal?: BaseBlock[keyof BaseBlock]
    breakPoints?: IteratableOpts
    iterDirection?: number
    invoker?: any
    category: BaseBlock[keyof BaseBlock]
}

interface KeyframeIterationConfigs {
    isRunning: boolean
    isFinished: boolean
    isReverse: boolean
    startTime: number
    iter: number
    currentOptIdx: number
    maxKeyframeLen: number
    // need to fix this any type KeyframesConfig
    keyframes?: {}
}

type AnimationId = string

export interface KeyframeIterations {
    [key: AnimationId]: KeyframeIterationConfigs &
        Required<{ [K in keyof KeyFrame]-?: KeyFrame[K] }>
}

export type CallbackAnimator = (timestamp: number, easing: number) => void

export interface IAnimationBlock extends IBaseBlockOptions {}

export const AnimationBlock = <TBase extends BlockConstructor<BaseBlock>>(
    Base: TBase
) =>
    class extends Base {
        #keyframeIterations: KeyframeIterations

        constructor(...args: any[]) {
            super(...args)
            this.#keyframeIterations = {}
        }

        animationStart(animationId: AnimationId) {
            const anime = this.#keyframeIterations[animationId]
            anime['isFinished'] = false
            anime['autoStart'] = true
            anime['isRunning'] = true
            anime.iter = 0
            anime.startTime = 0
        }
        animationStop(animationId: AnimationId) {
            this.#keyframeIterations[animationId]['isRunning'] = false
            this.#keyframeIterations[animationId]['autoStart'] = false
        }
        animationFinish(animationId: AnimationId) {
            this.#keyframeIterations[animationId]['isFinished'] = true
            this.#keyframeIterations[animationId]['isRunning'] = false
            this.#keyframeIterations[animationId]['autoStart'] = false
        }
        animationReverse(animationId: AnimationId) {
            const anime = this.#keyframeIterations[animationId]
            anime['isReverse'] = true
            if (anime['direction'] === 'normal') anime['direction'] = 'reverse'
            else if (anime['direction'] === 'reverse')
                anime['direction'] = 'normal'
            else if (anime['direction'] === 'alternate')
                anime['direction'] = 'alternate-reverse'
            else if (anime['direction'] === 'alternate-reverse')
                anime['direction'] = 'alternate'
            for (const [key, value] of anime.keyframes as any) {
                ;(anime['keyframes'] as any)[key].breakPoints =
                    value.breakPoints.reverse()
            }
        }
        animationDelay(animationId: AnimationId, value: Delay) {
            this.#keyframeIterations[animationId]['delay'] = value
        }
        animationPlaybackRate(animationId: AnimationId, value: PlaybackRate) {
            this.#keyframeIterations[animationId]['playbackRate'] = value
        }
        animationDirection(animationId: AnimationId, value: Direction) {
            this.#keyframeIterations[animationId]['direction'] = value
        }
        animationDuration(animationId: AnimationId, value: Duration) {
            this.#keyframeIterations[animationId]['duration'] = value
        }
        animationIterationStart(
            animationId: AnimationId,
            value: IterationStart
        ) {
            this.#keyframeIterations[animationId]['iterationStart'] = value
        }
        animationIterations(animationId: AnimationId, value: Iterations) {
            this.#keyframeIterations[animationId]['iterations'] = value
        }
        animationAutoStart(animationId: AnimationId, value: AutoStart) {
            this.#keyframeIterations[animationId]['autoStart'] = value
        }
        animate(keyframes: AnimationKeyframe, callback?: CallbackAnimator) {
            const dumyFunc = () => {}
            const {
                id,
                autoStart,
                iterations,
                delay,
                direction,
                duration,
                easing,
                iterationStart,
                playbackRate,
                onFinish,
                composite,
                ...options
            } = keyframes
            const animationId = id || String(new Date().getTime())

            this.#keyframeIterations[animationId] = {
                id: animationId,
                isRunning: true,
                isFinished: false,
                isReverse: false,
                iter: 0,
                startTime: 0,
                currentOptIdx: 0,
                maxKeyframeLen: 0,

                autoStart: autoStart || false,
                iterations: iterations || Infinity,
                delay: delay || 0,
                direction: direction || 'normal',
                composite: composite || 'replace',
                duration: duration || 1000,
                easing: easing || 'linear',
                iterationStart: iterationStart || 0.0,
                playbackRate: playbackRate || 1,
                onFinish: onFinish || dumyFunc,
            }
            this.#keyframeIterations[animationId]['keyframes'] = {}

            const keyframeIterations = this.#keyframeIterations[animationId]
            let maxBreakPointLen = 0
            for (let [key, keyframe] of Object.entries(options)) {
                const obj = getPrototype(this, key)
                if (!obj) continue
                let validKeyframe = keyframe
                const keyframes = keyframe.map((i: any) =>
                    this.__unitConverter({ val: i })
                )
                // fix type issue
                let category: any = typeof validKeyframe
                if (
                    typeof keyframes[0] === 'string' &&
                    (keyframes as any)[0].includes('rgba')
                ) {
                    validKeyframe = keyframes.map((i: any) => rgbaToArray(i))
                    category = 'color'
                }
                if (
                    keyframeIterations.direction === 'reverse' ||
                    keyframeIterations.direction === 'alternate-reverse'
                )
                    validKeyframe.reverse()

                let iterDirection = 1

                const idx = Math.round(
                    keyframeIterations.iterationStart *
                        (validKeyframe.length - 1)
                )

                let currentVal: RGBA | number = 0

                let nextValue = validKeyframe[idx]
                if (validKeyframe[idx + 1] !== undefined)
                    nextValue = validKeyframe[idx + 1]
                else if (validKeyframe[idx - 1] !== undefined)
                    nextValue = validKeyframe[idx - 1]

                if (category === 'color') {
                    const R =
                        validKeyframe[idx][0] +
                        nextValue[0] * keyframeIterations.iterationStart
                    const G =
                        validKeyframe[idx][1] +
                        nextValue[1] * keyframeIterations.iterationStart

                    const B =
                        validKeyframe[idx][2] +
                        nextValue[2] * keyframeIterations.iterationStart
                    const A =
                        validKeyframe[idx][3] +
                        nextValue[3] * keyframeIterations.iterationStart
                    currentVal = [R, G, B, A]
                } else {
                    currentVal =
                        validKeyframe[idx] +
                        nextValue * keyframeIterations.iterationStart
                }

                if (idx === validKeyframe.length - 1) iterDirection *= -1

                if (validKeyframe.length > maxBreakPointLen)
                    maxBreakPointLen = (validKeyframe as any).length as number
                    // fix type issue
                ;(this.#keyframeIterations[animationId]['keyframes'] as any)[
                    key
                ] = {
                    currentIdx: idx,
                    currentVal: currentVal,
                    breakPoints: validKeyframe,
                    iterDirection: iterDirection,
                    category: category,
                    invoker: obj,
                }
            }
            this.#keyframeIterations[animationId]['maxKeyframeLen'] =
                maxBreakPointLen
            const animator: Animator = (timestamp: number) => {
                const anime = this.#keyframeIterations[animationId]
                if (anime.autoStart === false || !anime.keyframes) return
                let isFinished = anime.isFinished

                if (
                    anime.delay <= timestamp &&
                    !isFinished &&
                    anime.isRunning
                ) {
                    const playBackRate = anime.playbackRate
                    const direction = anime.direction
                    const currentOptIdx = anime.currentOptIdx

                    if (!anime.startTime) {
                        anime.iter -= 1
                        anime.startTime = timestamp + anime.delay
                    }
                    if (
                        anime.iterations !== Infinity &&
                        anime.iter === anime.iterations
                    ) {
                        isFinished = true
                        this.animationFinish(animationId)
                        if (anime.onFinish) anime.onFinish()
                    }

                    const easing = easingParser(anime.easing)(
                        clamp(
                            (timestamp - anime.startTime) / anime.duration,
                            0,
                            1
                        ),
                        1 / anime.duration
                    )
                    if (
                        easing === 1 &&
                        (anime.direction == 'alternate' ||
                            anime.direction == 'alternate-reverse')
                    ) {
                        anime.startTime = timestamp
                    }
                    if (callback) callback(timestamp, easing)

                    for (let [idx, [key, value]] of Object.entries(
                        Object.entries(anime.keyframes)
                    )) {
                        if (
                            anime.composite == 'replace' &&
                            currentOptIdx !== Number(idx)
                        )
                            continue
                        let valueT = value as any

                        if (isFinished) {
                            let lastIdx = valueT.breakPoints.length - 1
                            if (
                                anime.direction === 'reverse' ||
                                anime.direction === 'alternate-reverse'
                            )
                                lastIdx = 0

                            valueT.invoker?.value.call(
                                this,
                                valueT.breakPoints[lastIdx]
                            )
                            continue
                        }
                        let currentIdx = valueT.currentIdx
                        let iterDirection = valueT.iterDirection
                        let nextIdx = currentIdx + iterDirection

                        let startVal = valueT.breakPoints[currentIdx]
                        let endVal = valueT.breakPoints[nextIdx]
                        let currentVal = valueT.currentVal

                        let statement = null

                        if (valueT.category === 'color') {
                            valueT.invoker?.value.call(
                                this,
                                rgbaRepresenter(currentVal)
                            )
                            const cancelOutR =
                                startVal[0] < endVal[0]
                                    ? startVal[0]
                                    : endVal[0]
                            const cancelOutG =
                                startVal[1] < endVal[1]
                                    ? startVal[1]
                                    : endVal[1]
                            const cancelOutB =
                                startVal[2] < endVal[2]
                                    ? startVal[2]
                                    : endVal[2]
                            const cancelOutA =
                                startVal[3] < endVal[3]
                                    ? startVal[3]
                                    : endVal[3]

                            const R =
                                (lerp(startVal[0], endVal[0], easing) -
                                    cancelOutR) *
                                    playBackRate +
                                cancelOutR
                            const G =
                                (lerp(startVal[1], endVal[1], easing) -
                                    cancelOutG) *
                                    playBackRate +
                                cancelOutG
                            const B =
                                (lerp(startVal[2], endVal[2], easing) -
                                    cancelOutB) *
                                    playBackRate +
                                cancelOutB
                            const A =
                                (lerp(startVal[3], endVal[3], easing) -
                                    cancelOutA) *
                                    playBackRate +
                                cancelOutA

                            currentVal = [
                                currentVal[0] + R,
                                currentVal[1] + G,
                                currentVal[2] + B,
                                currentVal[3] + A,
                            ]
                            statement =
                                (currentVal[0] > endVal[0] &&
                                    currentVal[1] > endVal[1] &&
                                    currentVal[2] > endVal[2] &&
                                    currentVal[3] > endVal[3]) ||
                                (currentVal[0] < endVal[0] &&
                                    currentVal[1] < endVal[1] &&
                                    currentVal[2] < endVal[2] &&
                                    currentVal[3] < endVal[3])
                            // statement =
                            //     ((startVal[0] <= endVal[0] &&
                            //         currentVal[0] >= endVal[0]) ||
                            //         (startVal[0] >= endVal[0] &&
                            //             currentVal[0] <= endVal[0])) &&
                            //     ((startVal[1] <= endVal[1] &&
                            //         currentVal[1] >= endVal[1]) ||
                            //         (startVal[1] >= endVal[1] &&
                            //             currentVal[1] <= endVal[1])) &&
                            //     ((startVal[2] <= endVal[2] &&
                            //         currentVal[2] >= endVal[2]) ||
                            //         (startVal[2] >= endVal[2] &&
                            //             currentVal[2] <= endVal[2])) &&
                            //     ((startVal[3] <= endVal[3] &&
                            //         currentVal[3] >= endVal[3]) ||
                            //         (startVal[3] >= endVal[3] &&
                            //             currentVal[3] <= endVal[3]))

                            // statement =
                            //     (startVal[0] >= endVal[0] &&
                            //         currentVal[0] <= endVal[0]) ||
                            //     (startVal[0] <= endVal[0] &&
                            //         currentVal[0] >= endVal[0])

                            //    Block.ts:3056 (4) [255, 0, 0, 1] (4) [0, 0, 255, 1] (4) [23079.564632861664, 0, 74075.43536713833, 381]
                        } else {
                            valueT.invoker?.value.call(this, currentVal)
                            const cancelOut =
                                startVal < endVal ? startVal : endVal
                            currentVal =
                                (lerp(startVal, endVal, easing) - cancelOut) *
                                    playBackRate +
                                cancelOut
                            statement =
                                (startVal <= endVal && currentVal >= endVal) ||
                                (startVal >= endVal && currentVal <= endVal)
                        }
                        if (statement) {
                            currentIdx += iterDirection
                            const lastIdx = valueT.breakPoints.length - 1
                            if (currentIdx === lastIdx) {
                                anime.currentOptIdx += 1
                                if (anime.composite === 'accumulate') {
                                    for (const [idx, val] of Object.entries(
                                        valueT.breakPoints
                                    )) {
                                        if (valueT.category === 'color') {
                                            valueT.breakPoints[idx][0] =
                                                (val as RGBA)[0] +
                                                valueT.breakPoints[lastIdx][0]
                                            valueT.breakPoints[idx][1] =
                                                (val as RGBA)[1] +
                                                valueT.breakPoints[lastIdx][1]
                                            valueT.breakPoints[idx][2] =
                                                (val as RGBA)[2] +
                                                valueT.breakPoints[lastIdx][2]
                                            valueT.breakPoints[idx][3] =
                                                (val as RGBA)[3] +
                                                valueT.breakPoints[lastIdx][3]
                                        } else {
                                            valueT.breakPoints[idx] =
                                                val +
                                                valueT.breakPoints[lastIdx]
                                        }
                                    }
                                }
                            }
                            if (
                                nextIdx === valueT.breakPoints.length - 1 ||
                                nextIdx === 0
                            ) {
                                if (
                                    direction === 'normal' ||
                                    direction === 'reverse'
                                ) {
                                    currentIdx = 0
                                    currentVal = valueT.breakPoints[0]
                                } else if (
                                    direction == 'alternate' ||
                                    direction == 'alternate-reverse'
                                ) {
                                    valueT.iterDirection *= -1
                                }
                            }
                            anime.startTime = timestamp
                            valueT.currentIdx = currentIdx
                        }

                        valueT.currentVal = currentVal
                    }

                    if (
                        anime.startTime &&
                        anime.startTime === timestamp + anime.delay
                    ) {
                        anime.iter += 1
                    }

                    if (
                        anime.currentOptIdx >=
                        Object.entries(anime.keyframes).length
                    )
                        anime.currentOptIdx = 0
                }
            }
            this.__addAnimation(animator)
            return animationId
        }
    }
