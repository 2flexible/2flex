---
id: circle
title: Circle
description: The CircleBlock — arcs, pies, custom radii, and borders.
---

`CircleBlock` extends [`ShapeBlock`](/api/shape-block). Its `width` and `height` define the bounding box, so setting them differently produces an ellipse.

```javascript


const block = new CircleBlock({
  width: 120,
  height: 120,
  backgroundColor: 'black',
});
```

## Custom radius

Use different width and height values for an elliptical shape.

```javascript
const ellipse = new CircleBlock({
  width: 50,
  height: 120,
  backgroundColor: 'black',
});
```

## Angles

`startAngle` and `endAngle` control which part of the circle is drawn. Angles are in radians.

```javascript
const half = new CircleBlock({
  width: 120,
  height: 120,
  startAngle: 0,
  endAngle: Math.PI,
});
```

| Option       | Type     | Default       |
| ------------ | -------- | ------------- |
| `startAngle` | `number` | `0`           |
| `endAngle`   | `number` | `Math.PI * 2` |

## Inner radius

Setting `innerRadius` turns the shape into a pie slice or ring segment.

```javascript
const pie = new CircleBlock({
  width: 120,
  height: 120,
  startAngle: 0,
  endAngle: Math.PI,
  innerRadius: 15,
});
```

| Option        | Type     | Default |
| ------------- | -------- | ------- |
| `innerRadius` | `number` | `0`     |

## Border

```javascript
const block = new CircleBlock({
  width: 120,
  height: 120,
  border: '30px solid white',
});
```

Or with the individual components:

```javascript
const block = new CircleBlock({
  width: 120,
  height: 120,
  borderWidth: 4,
  borderColor: 'white',
  borderStyle: 'solid',
});
```

## Reference

- [CircleBlock API](/api/circle-block)
- [ShapeBlock API](/api/shape-block) — inherited drawing options
