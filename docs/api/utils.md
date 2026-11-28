---
title: utils
description: The helper functions of the library — units, colors, easing, and geometry.
slug: utils
---

# Function: clamp()

```ts
function clamp(
   num,
   min,
   max
): number;
```

Keeps a number between two limits.

## Parameters

| Parameter | Type     | Description                                 |
| --------- | -------- | ------------------------------------------- |
| `num`     | `number` | The number that is kept between the limits. |
| `min`     | `number` | The smallest number the result can be.      |
| `max`     | `number` | The biggest number the result can be.       |

## Returns

`number`

# Function: lerp()

```ts
function lerp(
   start,
   end,
   t
): number;
```

Calculates the value between two numbers.

## Parameters

| Parameter | Type     | Description                                            |
| --------- | -------- | ------------------------------------------------------ |
| `start`   | `number` | The number the calculation starts at.                  |
| `end`     | `number` | The number the calculation ends at.                    |
| `t`       | `number` | The position between the two numbers, from `0` to `1`. |

## Returns

`number`

# Function: linear()

```ts
function linear(...args): LinearEasing;
```

## Parameters

| Parameter | Type       |
| --------- | ---------- |
| ...`args` | `number`[] |

## Returns

`LinearEasing`

# Function: steps()

```ts
function steps(step, position): StepsEasing;
```

## Parameters

| Parameter  | Type           |
| ---------- | -------------- |
| `step`     | `number`       |
| `position` | `JumpPosition` |

## Returns

`StepsEasing`
