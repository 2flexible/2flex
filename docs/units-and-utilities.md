---
id: units-and-utilities
title: Units and Utilities
description: The unit system, the utility functions exported by the package, and how relative values resolve.
---

## Units

Size and position options accept a value with an optional unit suffix. The unit determines how the value resolves against the parent.

| Unit     | Resolves against                                |
| -------- | ----------------------------------------------- |
| _(none)_ | The raw number, in pixels                       |
| `px`     | The raw number, in pixels                       |
| `%`      | The parent's width or height, depending on axis |
| `vw`     | The viewport width                              |
| `vh`     | The viewport height                             |
| `rem`    | The root font size                              |
| `em`     | The parent's font size                          |
| `cm`     | Centimetres, converted through the pixel ratio  |
| `mm`     | Millimetres, converted through the pixel ratio  |
| `q`      | Quarter-millimetres                             |
| `in`     | Inches                                          |
| `pc`     | Picas                                           |
| `pt`     | Points                                          |

```javascript
const block = new RectangleBlock({
  width: '50%',
  height: 120,
  marginLeft: '2rem',
  padding: '10px 20px',
});
```

## Unit helpers

Every unit has a matching helper function that converts a value into pixels. They are useful when you need the resolved number.

```javascript


const width = fromPercentage(50, 400);  // 200
const size = fromRem(2, 16);            // 32 at a 16px root font size
const viewport = fromVW(100, 1920);     // 1920 at a 1920px viewport
```

| Function         | Converts                     |
| ---------------- | ---------------------------- |
| `fromPercentage` | A percentage of a base value |
| `fromVW`         | Viewport width units         |
| `fromVH`         | Viewport height units        |
| `fromRem`        | Root em units                |
| `fromEm`         | Em units                     |
| `fromCm`         | Centimetres                  |
| `fromMm`         | Millimetres                  |
| `fromQ`          | Quarter-millimetres          |
| `fromIn`         | Inches                       |
| `fromPc`         | Picas                        |
| `fromPt`         | Points                       |

## Geometry helpers

```javascript

```

| Function                   | Purpose                                              |
| -------------------------- | ---------------------------------------------------- |
| `xIntersect`               | The horizontal overlap between two boxes             |
| `yIntersect`               | The vertical overlap between two boxes               |
| `checkInBound`             | Tests whether coordinates fall inside a bounding box |
| `rotateCordinatesByRadian` | Rotates a point around an origin                     |

## Angle helpers

```javascript


radianToDegree(Math.PI);  // 180
degreeToRadian(180);       // Math.PI
```

## Math helpers

```javascript


lerp(0, 100, 0.5);              // 50
clamp(150, 0, 100);             // 100
inRange(50, 0, 100);            // true
```

| Function  | Purpose                                    |
| --------- | ------------------------------------------ |
| `lerp`    | Linear interpolation between two values    |
| `clamp`   | Constrains a value to a range              |
| `inRange` | Tests whether a value falls inside a range |

## Easing helpers

```javascript


const easing = bezierEasing(0.1, 0.9, 0.9, 0.1);
```

| Function       | Purpose                                            |
| -------------- | -------------------------------------------------- |
| `bezierEasing` | Builds a cubic Bézier easing from four points      |
| `cubicBezier`  | Evaluates a cubic Bézier curve at a given progress |
| `linear`       | Linear easing                                      |
| `steps`        | Stepped easing                                     |

## Colour helpers

```javascript


hexToRgba('#3b82f6');                 // 'rgba(59, 130, 246, 1)'
hslToRgba('hsl(217, 91%, 60%)');       // 'rgba(59, 130, 246, 1)'
colorToRgba('#3b82f6');                // accepts any supported format
```

| Function      | Purpose                                         |
| ------------- | ----------------------------------------------- |
| `hexToRgba`   | Converts a hex colour to an rgba string         |
| `hslToRgba`   | Converts an HSL colour to an rgba string        |
| `colorToRgba` | Converts any supported colour to an rgba string |

## Reference

- [Utility API](/api/utils)
