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
    currentVal: unknown
    breakPoints: CompiledValue[]
    iterDirection: number
    invoker: any
    category: ValueKind
    underlyingValue: CompiledValue
    accumulator: CompiledValue
}

export interface KeyframeIterationConfig {
    isRunning: boolean
    isFinished: boolean
    isReverse: boolean
    startTime: number
    iter: number
    maxKeyframeLen: number
    pauseStartedAt: number
}

export type CallbackAnimator = (timestamp: number, easing: number) => void

export interface IAnimationBlock extends IBaseBlockOptions {}

type ValueKind =
    | 'number'
    | 'color'
    | 'boolean'
    | 'string'
    | 'array'
    | 'object'
    | 'unsupported'

type CompiledValue =
    | { kind: 'number'; value: number }
    | { kind: 'color'; value: RGBA }
    | { kind: 'discrete'; value: unknown }
    | { kind: 'array'; value: CompiledValue[] }
    | { kind: 'object'; value: Record<string, CompiledValue> }

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
            const pauseDuration = performance.now() - config.pauseStartedAt
            config.startTime += pauseDuration
        }
        animationStop(animationId: AnimationId) {
            const config = this.#keyframeIterationConfig[animationId]
            config['isRunning'] = false
            config['pauseStartedAt'] = performance.now()
        }
        animationFinish(animationId: AnimationId) {
            this.#applyFinalValues(animationId)
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
            for (const value of Object.values(this.#keyframes[animationId])) {
                value.breakPoints.reverse()
                value.accumulator = this.#zeroCompiled(value.breakPoints[0])
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
        #isRgbaString(value: unknown): value is string {
            return typeof value === 'string' && /^rgba\(/.test(value.trim())
        }
        #isPlainObject(value: unknown): value is Record<string, unknown> {
            if (typeof value !== 'object' || value === null) return false
            const proto = Object.getPrototypeOf(value)
            return proto === Object.prototype || proto === null
        }
        #detectValueKind(value: unknown): ValueKind {
            if (typeof value === 'number') return 'number'
            if (typeof value === 'boolean') return 'boolean'
            if (typeof value === 'string')
                return this.#isRgbaString(value) ? 'color' : 'string'
            if (value instanceof Array) return 'array'
            if (this.#isPlainObject(value)) return 'object'
            return 'unsupported'
        }
        #isAdditive(kind: ValueKind): boolean {
            return (
                kind === 'number' ||
                kind === 'color' ||
                kind === 'array' ||
                kind === 'object'
            )
        }
        #compileValue(value: unknown): CompiledValue {
            switch (this.#detectValueKind(value)) {
                case 'number':
                    return {
                        kind: 'number',
                        value: value as number,
                    }
                case 'color':
                    return {
                        kind: 'color',
                        value: rgbaToArray(value as string),
                    }
                case 'array':
                    return {
                        kind: 'array',
                        value: (value as unknown[]).map((item) =>
                            this.#compileValue(item)
                        ),
                    }
                case 'object': {
                    const object: Record<string, CompiledValue> = {}
                    for (const [key, item] of Object.entries(
                        value as Record<string, unknown>
                    )) {
                        object[key] = this.#compileValue(item)
                    }
                    return { kind: 'object', value: object }
                }
                default:
                    return { kind: 'discrete', value }
            }
        }
        #toRawValue(compiled: CompiledValue): unknown {
            switch (compiled.kind) {
                case 'number':
                case 'discrete':
                    return compiled.value
                case 'color':
                    return rgbaRepresenter(compiled.value)
                case 'array':
                    return compiled.value.map((item) => this.#toRawValue(item))
                case 'object': {
                    const object: Record<string, unknown> = {}
                    for (const [key, item] of Object.entries(compiled.value)) {
                        object[key] = this.#toRawValue(item)
                    }
                    return object
                }
            }
        }
        #zeroCompiled(compiled: CompiledValue): CompiledValue {
            switch (compiled.kind) {
                case 'number':
                    return { kind: 'number', value: 0 }
                case 'color':
                    return { kind: 'color', value: [0, 0, 0, 0] }
                case 'array':
                    return {
                        kind: 'array',
                        value: compiled.value.map((item) =>
                            this.#zeroCompiled(item)
                        ),
                    }
                case 'object': {
                    const object: Record<string, CompiledValue> = {}
                    for (const [key, item] of Object.entries(compiled.value)) {
                        object[key] = this.#zeroCompiled(item)
                    }
                    return { kind: 'object', value: object }
                }
                default:
                    return compiled
            }
        }
        #lerpNumber(start: number, end: number, t: number, rate: number) {
            const cancelOut = start < end ? start : end
            return (lerp(start, end, t) - cancelOut) * rate + cancelOut
        }
        #lerpCompiled(
            start: CompiledValue,
            end: CompiledValue,
            t: number,
            rate = 1
        ): CompiledValue {
            if (start.kind === 'number' && end.kind === 'number') {
                return {
                    kind: 'number',
                    value: this.#lerpNumber(start.value, end.value, t, rate),
                }
            }
            if (start.kind === 'color' && end.kind === 'color') {
                const value: RGBA = [0, 0, 0, 0]
                for (let idx = 0; idx < 4; idx++) {
                    value[idx] = this.#lerpNumber(
                        start.value[idx] ?? 0,
                        end.value[idx] ?? 0,
                        t,
                        rate
                    )
                }
                return { kind: 'color', value }
            }
            if (start.kind === 'array' && end.kind === 'array') {
                return {
                    kind: 'array',
                    value: start.value.map((item, idx) =>
                        this.#lerpCompiled(
                            item,
                            end.value[idx] ?? item,
                            t,
                            rate
                        )
                    ),
                }
            }
            if (start.kind === 'object' && end.kind === 'object') {
                const keys = new Set([
                    ...Object.keys(start.value),
                    ...Object.keys(end.value),
                ])
                const object: Record<string, CompiledValue> = {}
                for (const key of keys) {
                    const from = start.value[key]
                    const to = end.value[key]
                    object[key] = this.#lerpCompiled(
                        from ?? to,
                        to ?? from,
                        t,
                        rate
                    )
                }
                return { kind: 'object', value: object }
            }
            return t >= 0.5 ? end : start
        }
        #addCompiled(
            accumulator: CompiledValue,
            addend: CompiledValue
        ): CompiledValue {
            if (accumulator.kind === 'number' && addend.kind === 'number') {
                return {
                    kind: 'number',
                    value: accumulator.value + addend.value,
                }
            }
            if (accumulator.kind === 'color' && addend.kind === 'color') {
                const value: RGBA = [0, 0, 0, 0]
                for (let idx = 0; idx < 4; idx++) {
                    value[idx] =
                        (accumulator.value[idx] ?? 0) + (addend.value[idx] ?? 0)
                }
                return { kind: 'color', value }
            }
            if (accumulator.kind === 'array' && addend.kind === 'array') {
                return {
                    kind: 'array',
                    value: accumulator.value.map((item, idx) =>
                        this.#addCompiled(item, addend.value[idx] ?? item)
                    ),
                }
            }
            if (accumulator.kind === 'object' && addend.kind === 'object') {
                const keys = new Set([
                    ...Object.keys(accumulator.value),
                    ...Object.keys(addend.value),
                ])
                const object: Record<string, CompiledValue> = {}
                for (const key of keys) {
                    const from = accumulator.value[key]
                    const to = addend.value[key]
                    object[key] = this.#addCompiled(from ?? to, to ?? from)
                }
                return { kind: 'object', value: object }
            }
            if (accumulator.kind === 'discrete' && addend.kind === 'discrete') {
                return accumulator.value === addend.value ? accumulator : addend
            }
            return addend
        }
        #normalizeBreakpointArity(breakPoints: CompiledValue[]) {
            let maxLength = 0
            for (const breakPoint of breakPoints) {
                if (
                    breakPoint.kind === 'array' &&
                    breakPoint.value.length > maxLength
                )
                    maxLength = breakPoint.value.length
            }
            if (maxLength === 0) return
            for (const breakPoint of breakPoints) {
                if (
                    breakPoint.kind !== 'array' ||
                    breakPoint.value.length === 0
                )
                    continue
                while (breakPoint.value.length < maxLength) {
                    breakPoint.value.push(
                        breakPoint.value[breakPoint.value.length - 1]
                    )
                }
            }
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
            const nonAdditiveKeys: string[] = []

            for (const [key, keyframe] of Object.entries(keyframeOptions)) {
                const obj = getPrototype(this, key)
                if (!obj) continue

                const currentObjValue = obj.value.call(this)

                const breakPoints = keyframe.map((frameValue: any) =>
                    obj.value.call(this, frameValue)
                )
                obj.value.call(this, currentObjValue)

                const compiled = breakPoints.map((value: any) =>
                    this.#compileValue(value)
                )
                this.#normalizeBreakpointArity(compiled)

                const currentKind = this.#detectValueKind(currentObjValue)
                const category =
                    currentKind !== 'unsupported'
                        ? currentKind
                        : this.#detectValueKind(breakPoints[0])

                if (
                    settings.composite !== 'replace' &&
                    !this.#isAdditive(category)
                )
                    nonAdditiveKeys.push(key)

                if (
                    settings.direction === 'reverse' ||
                    settings.direction === 'alternate-reverse'
                )
                    compiled.reverse()

                let iterDirection = 1
                const idx = Math.round(iterationStart * (compiled.length - 1))

                const nextValue =
                    compiled[idx + 1] ?? compiled[idx - 1] ?? compiled[idx]

                const currentVal = this.#toRawValue(
                    this.#lerpCompiled(compiled[idx], nextValue, iterationStart)
                )

                if (idx === compiled.length - 1) iterDirection *= -1

                if (compiled.length > maxBreakPointLen)
                    maxBreakPointLen = compiled.length
                ;(this.#keyframes[animationId] ??= {})[key] = {
                    currentIdx: idx,
                    currentVal: currentVal,
                    breakPoints: compiled,
                    iterDirection: iterDirection,
                    category: category,
                    invoker: obj,
                    underlyingValue:
                        this.#detectValueKind(currentObjValue) !== 'unsupported'
                            ? this.#compileValue(currentObjValue)
                            : this.#zeroCompiled(compiled[0]),
                    accumulator: this.#zeroCompiled(compiled[0]),
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
                maxKeyframeLen: 0,
                pauseStartedAt: 0,
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
                    config.startTime = timestamp + settings.delay
                }
                if (
                    settings.iterations !== Infinity &&
                    config.iter === settings.iterations
                ) {
                    this.#applyFinalValues(animationId)
                    config.isFinished = true
                    config.isRunning = false
                    settings.onFinish()
                    return
                }

                const rawProgress =
                    (timestamp - config.startTime) / settings.duration
                const parsedEasing = easingParser(settings.easing)(
                    clamp(rawProgress, 0, 1)
                )
                const segmentComplete = rawProgress >= 1
                if (callback) callback(timestamp, parsedEasing)

                const keyframes = this.#keyframes[animationId]

                for (const valueT of Object.values(keyframes)) {
                    let currentIdx = valueT.currentIdx
                    const iterDirection = valueT.iterDirection
                    const nextIdx = currentIdx + iterDirection

                    const startVal = valueT.breakPoints[currentIdx]
                    const endVal = valueT.breakPoints[nextIdx] ?? startVal

                    const additive = this.#isAdditive(valueT.category)
                    const off = !additive
                        ? undefined
                        : settings.composite === 'add'
                          ? valueT.underlyingValue
                          : settings.composite === 'accumulate'
                            ? valueT.accumulator
                            : undefined

                    const currentVal = this.#lerpCompiled(
                        startVal,
                        endVal,
                        parsedEasing,
                        settings.playbackRate
                    )

                    valueT.invoker?.value.call(
                        this,
                        this.#toRawValue(
                            off
                                ? this.#addCompiled(currentVal, off)
                                : currentVal
                        )
                    )

                    if (segmentComplete) {
                        currentIdx += iterDirection
                        const lastIdx = valueT.breakPoints.length - 1
                        if (
                            currentIdx === lastIdx &&
                            settings.composite === 'accumulate' &&
                            additive
                        ) {
                            valueT.accumulator = this.#addCompiled(
                                valueT.accumulator,
                                valueT.breakPoints[
                                    iterDirection > 0 ? lastIdx : 0
                                ] ?? startVal
                            )
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

                    valueT.currentVal = this.#toRawValue(currentVal)
                }

                if (segmentComplete) {
                    config.iter += 1
                    if (
                        settings.iterations !== Infinity &&
                        config.iter === settings.iterations
                    ) {
                        this.#applyFinalValues(animationId)
                        config.isFinished = true
                        config.isRunning = false
                        settings.onFinish()
                        return
                    }
                }

                this.__invokeChange()
            }
        }
        #applyFinalValues(animationId: AnimationId) {
            const settings = this.#animationSettings[animationId]
            const keyframes = this.#keyframes[animationId]
            if (!keyframes) return

            let hasApplied = false

            for (const valueT of Object.values(keyframes)) {
                const lastIdx = valueT.breakPoints.length - 1
                const finalIdx =
                    settings.direction === 'reverse' ||
                    settings.direction === 'alternate-reverse'
                        ? 0
                        : lastIdx
                const finalBreak = valueT.breakPoints[finalIdx]
                if (finalBreak === undefined) continue

                const additive = this.#isAdditive(valueT.category)
                const off = !additive
                    ? undefined
                    : settings.composite === 'add'
                      ? valueT.underlyingValue
                      : settings.composite === 'accumulate'
                        ? valueT.accumulator
                        : undefined

                valueT.invoker?.value.call(
                    this,
                    this.#toRawValue(
                        off ? this.#addCompiled(finalBreak, off) : finalBreak
                    )
                )
                hasApplied = true
            }

            if (hasApplied) this.__invokeChange()
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
