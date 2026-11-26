---
id: image
title: Image
description: The ImageBlock — clipping, object-fit modes, and repetition.
---

`ImageBlock` combines the canvas `drawImage` method with the CSS `object-fit` property.

```javascript


const block = new ImageBlock({
  source: '/image.png',
  width: 120,
  height: 60,
});
```

The `source` option accepts a path, a URL, or an already-loaded `HTMLImageElement`.

```javascript
// A remote URL
const remote = new ImageBlock({
  source: 'https://example.com/image.jpg',
  width: 240,
  height: 120,
});
```

## Clipping

Crop the image with `clipX`, `clipY`, `clipWidth`, and `clipHeight`. The clip origin is the top-left of the source image.

```javascript
const block = new ImageBlock({
  source: '/image.png',
  width: 120,
  height: 60,
  clipX: 30,
  clipY: 20,
  clipWidth: 50,
  clipHeight: 40,
});
```

| Option       | Type     | Default     |
| ------------ | -------- | ----------- |
| `clipX`      | `number` | `0`         |
| `clipY`      | `number` | `0`         |
| `clipWidth`  | `number` | `undefined` |
| `clipHeight` | `number` | `undefined` |

## Object fit

The `objectFit` option mirrors the CSS property.

```javascript
const block = new ImageBlock({
  source: '/image.png',
  width: 120,
  height: 60,
  objectFit: 'cover',
});
```

| Value        | Behaviour                                            |
| ------------ | ---------------------------------------------------- |
| `scale-down` | The default — shrink to fit, never scale up          |
| `contain`    | Fits inside the box, preserving the aspect ratio     |
| `cover`      | Fills the box, preserving the aspect ratio           |
| `fill`       | Stretches to fill the box, ignoring the aspect ratio |

## Repetition

Tile the image across the block. `repeatX` and `repeatY` accept a number or the string `"fill"`.

```javascript
const block = new ImageBlock({
  source: '/tile.png',
  width: 120,
  height: 60,
  repeatX: 'fill',
  repeatY: 2,
});
```

| Option    | Type               | Default     |
| --------- | ------------------ | ----------- |
| `repeatX` | `number \| "fill"` | `undefined` |
| `repeatY` | `number \| "fill"` | `undefined` |

## Reference

- [ImageBlock API](/api/image-block)
- [Media layout options](/api/image-block) — shared with `VideoBlock`
