import { BaseBlock, IBaseBlockOptions } from '../BaseBlock'
import type {
    AnimationId,
    Animator,
    BlockConstructor,
    Composite,
    Direction,
    Easing,
    RGBA,
} from '../types'
import {
    clamp,
    easingParser,
    getPrototype,
    lerp,
    namedColors,
    rgbaRepresenter,
    rgbaToArray,
} from '../Utils'

export type Delay = number
export type Iterations = number
export type Duration = number
export type IterationStart = number
export type PlaybackRate = number
export type AutoStart = boolean
export type IteratableOpts = { [key: string]: any }

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

export interface KeyframesConfig {
    currentIdx: number
    currentVal: any
    breakPoints: IteratableOpts
    iterDirection: number
    invoker: any
    category: any
}

export interface KeyframeIterationConfig {
    isRunning: boolean
    isFinished: boolean
    isReverse: boolean
    startTime: number
    iter: number
    currentOptIdx: number
    maxKeyframeLen: number
}

export type CallbackAnimator = (timestamp: number, easing: number) => void

export interface IAnimationBlock extends IBaseBlockOptions {}

export const AnimationBlock = <TBase extends BlockConstructor<BaseBlock>>(
    Base: TBase
) =>
    class extends Base {
        #animationSettings: {
            [animationId: AnimationId]: {
                [K in keyof AnimationKeyframe]-?: AnimationKeyframe[K]
            }
        }
        #keyframes: {
            [animationId: AnimationId]: { [key: string]: KeyframesConfig }
        }
        #keyframeIterationConfig: {
            [animationId: AnimationId]: KeyframeIterationConfig
        }

        constructor(...args: any[]) {
            super(...args)
            this.#keyframes = {}
            this.#keyframeIterationConfig = {}
            this.#animationSettings = {}
        }

        animationStart(animationId: AnimationId) {
            const config = this.#keyframeIterationConfig[animationId]
            config['isFinished'] = false
            config['isRunning'] = true
            config.iter = 0
            config.startTime = 0
        }
        animationStop(animationId: AnimationId) {
            this.#keyframeIterationConfig[animationId]['isRunning'] = false
        }
        animationFinish(animationId: AnimationId) {
            this.#keyframeIterationConfig[animationId]['isFinished'] = true
            this.#keyframeIterationConfig[animationId]['isRunning'] = false
        }
        animationReverse(animationId: AnimationId) {
            const config = this.#keyframeIterationConfig[animationId]
            const settings = this.#animationSettings[animationId]
            config['isReverse'] = true
            if (settings['direction'] === 'normal')
                settings['direction'] = 'reverse'
            else if (settings['direction'] === 'reverse')
                settings['direction'] = 'normal'
            else if (settings['direction'] === 'alternate')
                settings['direction'] = 'alternate-reverse'
            else if (settings['direction'] === 'alternate-reverse')
                settings['direction'] = 'alternate'
            for (const [key, value] of Object.entries(
                this.#keyframes[animationId]
            )) {
                value.breakPoints.reverse()
            }
        }
        animationDelay(animationId: AnimationId, value: Delay) {
            this.#animationSettings[animationId]['delay'] = value
        }
        animationPlaybackRate(animationId: AnimationId, value: PlaybackRate) {
            this.#animationSettings[animationId]['playbackRate'] = value
        }
        animationDirection(animationId: AnimationId, value: Direction) {
            this.#animationSettings[animationId]['direction'] = value
        }
        animationDuration(animationId: AnimationId, value: Duration) {
            this.#animationSettings[animationId]['duration'] = value
        }
        animationIterationStart(
            animationId: AnimationId,
            value: IterationStart
        ) {
            this.#animationSettings[animationId]['iterationStart'] = value
        }
        animationIterations(animationId: AnimationId, value: Iterations) {
            this.#animationSettings[animationId]['iterations'] = value
        }
        animationAutoStart(animationId: AnimationId, value: AutoStart) {
            this.#animationSettings[animationId]['autoStart'] = value
        }
        removeAnimation(animationId: AnimationId) {
            this.__removeAnimation(animationId)
        }
        #generateAnimationId() {
            return String(new Date().getTime())
        }
        #buildKeyframes(
            animationId: AnimationId,
            keyframeOptions: IteratableOpts
        ) {
            const config = this.#keyframeIterationConfig[animationId]
            const settings = this.#animationSettings[animationId]
            const iterationStart = settings.iterationStart

            let maxBreakPointLen = 0

            for (let [key, keyframe] of Object.entries(keyframeOptions)) {
                const obj = getPrototype(this, key)
                if (!obj) continue
                const currentObjValue = obj.value.call(this)

                let validKeyframe = keyframe
                let category

                validKeyframe = keyframe.map((frameValue: any) =>
                    obj.value.call(this, frameValue)
                )
                obj.value.call(this, currentObjValue)
                if (
                    typeof validKeyframe[0] === 'string' &&
                    (validKeyframe as any)[0].includes('rgba')
                ) {
                    validKeyframe = validKeyframe.map((i: any) =>
                        rgbaToArray(i)
                    )
                    category = 'color'
                }

                if (
                    settings.direction === 'reverse' ||
                    settings.direction === 'alternate-reverse'
                )
                    validKeyframe.reverse()

                let iterDirection = 1
                const idx = Math.round(
                    iterationStart * (validKeyframe.length - 1)
                )
                let currentVal: RGBA | number = 0

                let nextValue = validKeyframe[idx]
                if (validKeyframe[idx + 1] !== undefined)
                    nextValue = validKeyframe[idx + 1]
                else if (validKeyframe[idx - 1] !== undefined)
                    nextValue = validKeyframe[idx - 1]

                if (category === 'color') {
                    const R =
                        validKeyframe[idx][0] + nextValue[0] * iterationStart
                    const G =
                        validKeyframe[idx][1] + nextValue[1] * iterationStart

                    const B =
                        validKeyframe[idx][2] + nextValue[2] * iterationStart
                    const A =
                        validKeyframe[idx][3] + nextValue[3] * iterationStart
                    currentVal = [R, G, B, A]
                } else {
                    currentVal = validKeyframe[idx] + nextValue * iterationStart
                }

                if (idx === validKeyframe.length - 1) iterDirection *= -1

                if (validKeyframe.length > maxBreakPointLen)
                    maxBreakPointLen = validKeyframe.length as number
                ;(this.#keyframes[animationId] ??= {})[key] = {
                    currentIdx: idx,
                    currentVal: currentVal,
                    breakPoints: validKeyframe,
                    iterDirection: iterDirection,
                    category: category,
                    invoker: obj,
                }
            }
            config['maxKeyframeLen'] = maxBreakPointLen
        }
        #keyframeParser(
            animationId: AnimationId,
            keyframes: AnimationKeyframe
        ) {
            this.#animationSettings[animationId] = {
                id: keyframes.id ?? animationId,
                autoStart: keyframes.autoStart ?? false,
                iterations: keyframes.iterations ?? Infinity,
                delay: keyframes.delay ?? 0,
                direction: keyframes.direction ?? 'normal',
                composite: keyframes.composite ?? 'replace',
                duration: keyframes.duration ?? 1000,
                easing: keyframes.easing ?? 'linear',
                iterationStart: keyframes.iterationStart ?? 0.0,
                playbackRate: keyframes.playbackRate ?? 1,
                onFinish: keyframes.onFinish ?? (() => {}),
            }
            this.#keyframeIterationConfig[animationId] = {
                isRunning: keyframes.autoStart ?? false,
                isFinished: false,
                isReverse: false,
                iter: 0,
                startTime: 0,
                currentOptIdx: 0,
                maxKeyframeLen: 0,
            }
        }
        #buildAnimator(
            animationId: AnimationId,
            callback?: CallbackAnimator
        ): Animator {
            return (timestamp: number) => {
                const settings = this.#animationSettings[animationId]
                const config = this.#keyframeIterationConfig[animationId]
                if (
                    !(
                        settings.delay <= timestamp &&
                        !config.isFinished &&
                        config.isRunning
                    )
                )
                    return

                if (!config.startTime) {
                    config.iter -= 1
                    config.startTime = timestamp + settings.delay
                }
                if (
                    settings.iterations !== Infinity &&
                    config.iter === settings.iterations
                ) {
                    config.isFinished = true
                    config.isRunning = false
                    settings.onFinish()
                }

                const parsedEasing = easingParser(settings.easing)(
                    clamp(
                        (timestamp - config.startTime) / settings.duration,
                        0,
                        1
                    ),
                    1 / settings.duration
                )
                if (
                    parsedEasing === 1 &&
                    (settings.direction == 'alternate' ||
                        settings.direction == 'alternate-reverse')
                ) {
                    config.startTime = timestamp
                }
                if (callback) callback(timestamp, parsedEasing)

                const keyframes = this.#keyframes[animationId]

                for (let [idx, [key, value]] of Object.entries(
                    Object.entries(keyframes)
                )) {
                    if (
                        settings.composite == 'replace' &&
                        config.currentOptIdx !== Number(idx)
                    )
                        continue
                    let valueT = value

                    if (config.isFinished) {
                        let lastIdx = valueT.breakPoints.length - 1
                        if (
                            settings.direction === 'reverse' ||
                            settings.direction === 'alternate-reverse'
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
                            startVal[0] < endVal[0] ? startVal[0] : endVal[0]
                        const cancelOutG =
                            startVal[1] < endVal[1] ? startVal[1] : endVal[1]
                        const cancelOutB =
                            startVal[2] < endVal[2] ? startVal[2] : endVal[2]
                        const cancelOutA =
                            startVal[3] < endVal[3] ? startVal[3] : endVal[3]
                        const R =
                            (lerp(startVal[0], endVal[0], parsedEasing) -
                                cancelOutR) *
                                settings.playbackRate +
                            cancelOutR
                        const G =
                            (lerp(startVal[1], endVal[1], parsedEasing) -
                                cancelOutG) *
                                settings.playbackRate +
                            cancelOutG
                        const B =
                            (lerp(startVal[2], endVal[2], parsedEasing) -
                                cancelOutB) *
                                settings.playbackRate +
                            cancelOutB
                        const A =
                            (lerp(startVal[3], endVal[3], parsedEasing) -
                                cancelOutA) *
                                settings.playbackRate +
                            cancelOutA

                        currentVal = [R, G, B, A]
                        statement =
                            ((startVal[0] <= endVal[0] &&
                                currentVal[0] >= endVal[0]) ||
                                (startVal[0] >= endVal[0] &&
                                    currentVal[0] <= endVal[0])) &&
                            ((startVal[1] <= endVal[1] &&
                                currentVal[1] >= endVal[1]) ||
                                (startVal[1] >= endVal[1] &&
                                    currentVal[1] <= endVal[1])) &&
                            ((startVal[2] <= endVal[2] &&
                                currentVal[2] >= endVal[2]) ||
                                (startVal[2] >= endVal[2] &&
                                    currentVal[2] <= endVal[2])) &&
                            ((startVal[3] <= endVal[3] &&
                                currentVal[3] >= endVal[3]) ||
                                (startVal[3] >= endVal[3] &&
                                    currentVal[3] <= endVal[3]))
                    } else {
                        valueT.invoker?.value.call(this, currentVal)
                        const cancelOut = startVal < endVal ? startVal : endVal
                        currentVal =
                            (lerp(startVal, endVal, parsedEasing) - cancelOut) *
                                settings.playbackRate +
                            cancelOut
                        statement =
                            (startVal <= endVal && currentVal >= endVal) ||
                            (startVal >= endVal && currentVal <= endVal)
                    }
                    if (statement) {
                        currentIdx += iterDirection
                        const lastIdx = valueT.breakPoints.length - 1
                        if (currentIdx === lastIdx) {
                            config.currentOptIdx += 1
                            if (settings.composite === 'accumulate') {
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
                                            val + valueT.breakPoints[lastIdx]
                                    }
                                }
                            }
                        }
                        if (
                            nextIdx === valueT.breakPoints.length - 1 ||
                            nextIdx === 0
                        ) {
                            if (
                                settings.direction === 'normal' ||
                                settings.direction === 'reverse'
                            ) {
                                currentIdx = 0
                                currentVal = valueT.breakPoints[0]
                            } else if (
                                settings.direction == 'alternate' ||
                                settings.direction == 'alternate-reverse'
                            ) {
                                valueT.iterDirection *= -1
                            }
                        }
                        config.startTime = timestamp
                        valueT.currentIdx = currentIdx
                    }

                    valueT.currentVal = currentVal
                }

                if (
                    config.startTime &&
                    config.startTime === timestamp + settings.delay
                ) {
                    config.iter += 1
                }

                if (config.currentOptIdx >= Object.entries(keyframes).length)
                    config.currentOptIdx = 0

                this.__invokeChange()
            }
        }
        animate(keyframes: AnimationKeyframe, callback?: CallbackAnimator) {
            const animationId = keyframes.id ?? this.#generateAnimationId()
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
            this.#keyframeParser(animationId, keyframes)
            this.#buildKeyframes(animationId, options)
            const animator = this.#buildAnimator(animationId, callback)
            this.__addAnimation(animationId, animator)
            return animationId
        }
    }
