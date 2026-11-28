---
title: CanvasOptions
description: The `CanvasOptions` API of the 2flex library.
slug: canvas-options
---

# Interface: CanvasOptions

## Properties

### zoomSpeed?

```ts
zoomSpeed?: number;
```

The multiplier that is applied to the zoom on every step of the wheel.

#### Default Value

```ts
1.2
```

---

### zoomInvSpeed?

```ts
zoomInvSpeed?: number;
```

The multiplier that is applied to the zoom on every step of the wheel
while zooming out.

#### Default Value

```ts
0.8
```

---

### moveSpeed?

```ts
moveSpeed?: number;
```

The number of pixels the viewport moves on every step of a key.

#### Default Value

```ts
100
```

---

### zoomType?

```ts
zoomType?: "center" | "point";
```

Whether the zoom is centred on the canvas or on the pointer.

With `center` the canvas only zooms to the centre of the canvas. With
`point` the canvas zooms to the place the mouse points at.

#### Default Value

```ts
'center'
```

---

### keyboardMovement?

```ts
keyboardMovement?: boolean;
```

Whether the canvas can be moved with the arrow keys.

#### Default Value

```ts
true
```

---

### mouseMovement?

```ts
mouseMovement?: boolean;
```

Whether the canvas can be moved by dragging its background.

The movement starts when the space key is pressed.

#### Default Value

```ts
true
```

---

### history?

```ts
history?: boolean;
```

Whether the actions of the canvas are stored in its history.

#### Default Value

```ts
true
```

---

### historySize?

```ts
historySize?: number;
```

The number of actions the history of the canvas keeps.

When the history is full the oldest action is dropped to make room for
the new one.

#### Default Value

```ts
100
```

---

### positionX?

```ts
positionX?: number;
```

The horizontal offset of the viewport at the start.

#### Default Value

```ts
0
```

---

### positionY?

```ts
positionY?: number;
```

The vertical offset of the viewport at the start.

#### Default Value

```ts
0
```

---

### positionZ?

```ts
positionZ?: number;
```

The zoom level of the viewport at the start.

#### Default Value

```ts
1
```

---

### fps?

```ts
fps?: number;
```

The number of frames the canvas draws in a second.

#### Default Value

```ts
60
```

---

### tileSize?

```ts
tileSize?: number;
```

The size of the tiles the canvas is divided into, in pixels.

A smaller tile uses less memory, a bigger tile renders faster.

#### Default Value

```ts
256
```

---

### qualitySettleDelay?

```ts
qualitySettleDelay?: number;
```

The number of milliseconds the canvas waits before it draws a frame in
a higher quality after the zoom came to a stop.

#### Default Value

```ts
150
```

---

### maxQuality?

```ts
maxQuality?: number;
```

The highest quality the canvas draws in.

#### Default Value

```ts
2
```
