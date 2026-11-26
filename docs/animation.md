---
id: animation
title: Animation
description: Animate block options with keyframes — easing, direction, iterations, compositing, delays, and playback control.
---

Every block can animate its own options. The animation engine interpolates between keyframes and applies the result to the block on each frame.

```typescript


const block = new RectangleBlock({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  backgroundColor: '#3b82f6',
});

block.animate({
  x: [0, 300, 0],
  duration: 2000,
  iterations: Infinity,
  easing: 'ease-in-out',
});
```

## How keyframes work

The options object you pass to `animate` mixes two kinds of key:

- **Reserved keys** — `duration`, `delay`, `easing`, and the rest — configure the animation itself.
- **Everything else** is an option to animate. The value is a list of breakpoints, and the engine interpolates between them.

```typescript
block.animate({
  // Reserved — these configure the animation
  duration: 1500,
  easing: 'ease-out',
  iterations: 3,

  // Animated — these are the block's options
  x: [0, 200],
  backgroundColor: ['#3b82f6', '#ef4444'],
  rotate: [0, Math.PI * 2],
});
```

> [!NOTE] Two breakpoints means a straight interpolation
>
> With `[0, 200]` the value moves from `0` to `200` over the whole duration. With `[0, 200, 0]` it moves to `200` and back again.

### What can be animated

| Kind    | Examples                                                  |
| ------- | --------------------------------------------------------- |
| Numbers | `x`, `y`, `width`, `height`, `rotate`, `opacity`          |
| Colours | `backgroundColor`, `borderColor` — as `rgba(...)` strings |
| Arrays  | `borderRadius`, `colorStops`                              |
| Objects | `drawImage`, `clip`                                       |

Colours are interpolated channel by channel, which is why they must be in `rgba(...)` form. The library normalises named and hex colours for you, so `backgroundColor: ['red', 'blue']` works.

> [!WARNING] Discrete values snap
>
> A value that is neither a number, a colour, an array, nor a plain object is treated as discrete. It changes at the halfway point of the segment rather than interpolating.

## Animation settings

| Option           | Type                                                          | Default     | What it does                                     |
| ---------------- | ------------------------------------------------------------- | ----------- | ------------------------------------------------ |
| `id`             | `string`                                                      | generated   | The animation's identifier                       |
| `duration`       | `number`                                                      | `1000`      | The length of one iteration, in milliseconds     |
| `delay`          | `number`                                                      | `0`         | The wait before the animation starts             |
| `iterations`     | `number`                                                      | `Infinity`  | How many times it runs                           |
| `iterationStart` | `number`                                                      | `0`         | Where in the timeline it starts, from `0` to `1` |
| `easing`         | `string \| function`                                          | `'linear'`  | The easing curve                                 |
| `direction`      | `'normal' \| 'reverse' \| 'alternate' \| 'alternate-reverse'` | `'normal'`  | The playback direction                           |
| `composite`      | `'replace' \| 'add' \| 'accumulate'`                          | `'replace'` | How iterations combine                           |
| `playbackRate`   | `number`                                                      | `1`         | The speed multiplier                             |
| `autoStart`      | `boolean`                                                     | `false`     | Whether it starts on its own                     |
| `onFinish`       | `() => void`                                                  | no-op       | Called when the animation ends                   |

### autoStart

By default an animation is created paused. Start it explicitly.

```typescript
const id = block.animate({
  x: [0, 200],
  duration: 1000,
});

block.animationStart(id);
```

Set `autoStart: true` to have it running as soon as it is created.

```typescript
block.animate({
  x: [0, 200],
  duration: 1000,
  autoStart: true,
});
```

## Easing

The built-in easing functions match the CSS names.

| Name            | The curve                          |
| --------------- | ---------------------------------- |
| `'linear'`      | A constant rate                    |
| `'ease'`        | The CSS `ease` curve               |
| `'ease-in'`     | Slow to start                      |
| `'ease-out'`    | Slow to stop                       |
| `'ease-in-out'` | Slow to start and stop             |
| `'step-start'`  | Jumps to the end value immediately |
| `'step-end'`    | Jumps to the end value at the end  |

```typescript
block.animate({
  x: [0, 200],
  duration: 800,
  easing: 'ease-out',
});
```

### A custom easing function

An easing function takes the normalised time and returns the eased value.

```typescript
block.animate({
  x: [0, 200],
  duration: 800,
  easing: (t) => t * t,
});
```

The library exports the building blocks for more elaborate curves.

```typescript


// A cubic Bézier easing curve
const ease = bezierEasing(0.42, 0, 0.58, 1);

// A piecewise linear curve
const piecewise = linear(0, 0.25, 0.5, 1);

// A stepped curve
const stepped = steps(4, 'jump-end');
```

> [!NOTE] bezierEasing returns a two-argument function
>
> The easing functions used by the animation engine take `(t, duration)`. The exported `bezierEasing` returns a function with that signature, so it can be passed straight to `easing`.

## Direction

`direction` controls how the animation plays.

| Value                 | Behaviour                                      |
| --------------------- | ---------------------------------------------- |
| `'normal'`            | Plays forwards from the first keyframe         |
| `'reverse'`           | Plays backwards from the last keyframe         |
| `'alternate'`         | Plays forwards, then backwards, then forwards  |
| `'alternate-reverse'` | Plays backwards, then forwards, then backwards |

```typescript
block.animate({
  x: [0, 200],
  duration: 1000,
  direction: 'alternate',
  iterations: Infinity,
});
```

## Compositing

`composite` decides how successive iterations combine.

| Value                 | Behaviour                                                   |
| --------------------- | ----------------------------------------------------------- |
| `'replace'` (default) | Each iteration starts from the keyframe values              |
| `'add'`               | Each iteration's values are added to the underlying value   |
| `'accumulate'`        | Each iteration's values are added to the previous iteration |

```typescript
// A pulse that keeps growing
block.animate({
  width: [100, 120],
  duration: 500,
  composite: 'accumulate',
  iterations: 5,
});
```

> [!NOTE] Compositing only applies to additive values
>
> Only numbers, colours, arrays, and objects can be composed. A discrete value always replaces the previous one.

## Playback control

`animate` returns an animation id. Use it to control the animation.

| Method                               | What it does                                  |
| ------------------------------------ | --------------------------------------------- |
| `animationStart(id)`                 | Starts or resumes it                          |
| `animationStop(id)`                  | Pauses it                                     |
| `animationFinish(id)`                | Jumps to the end and applies the final values |
| `animationReverse(id)`               | Reverses the direction and the keyframes      |
| `animationDelay(id, value)`          | Sets the delay                                |
| `animationDuration(id, value)`       | Sets the duration                             |
| `animationIterations(id, value)`     | Sets the iteration count                      |
| `animationIterationStart(id, value)` | Sets the start position in the timeline       |
| `animationPlaybackRate(id, value)`   | Sets the speed multiplier                     |
| `animationDirection(id, value)`      | Sets the direction                            |
| `animationAutoStart(id, value)`      | Sets whether it auto-starts                   |
| `removeAnimation(id)`                | Removes it entirely                           |

```typescript
const id = block.animate({
  x: [0, 200],
  duration: 2000,
  iterations: Infinity,
});

block.animationStop(id);
block.animationPlaybackRate(id, 2);
block.animationStart(id);

// Later
block.removeAnimation(id);
```

> [!WARNING] animationReverse resets the accumulator
>
> Calling `animationReverse` flips the direction setting and reverses the keyframe list, so calling it twice restores the original order. But it also resets the accumulated value to zero. With `composite: 'accumulate'`, reversing in the middle of a run discards what has been accumulated so far.

## The callback

`animate` takes an optional second argument that is called on every frame with the timestamp and the eased progress.

```typescript
block.animate(
  {
    x: [0, 200],
    duration: 1000,
  },
  (timestamp, eased) => {
    console.log('at', timestamp, 'progress', eased);
  },
);
```

## Starting partway through

`iterationStart` sets where in the timeline the animation begins, from `0` to `1`.

```typescript
// Start halfway through
block.animate({
  x: [0, 200],
  duration: 1000,
  iterationStart: 0.5,
});
```

## onFinish

`onFinish` fires when the animation runs out of iterations.

```typescript
block.animate({
  x: [0, 200],
  duration: 1000,
  iterations: 1,
  onFinish: () => {
    console.log('done');
  },
});
```

## Next steps

- [Custom blocks](/docs/custom-blocks/) — build your own block type.
- [Events](/docs/events/) — trigger animations from user actions.
