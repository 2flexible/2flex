---
id: media
title: Media
description: Place images and video on the canvas — sources, object-fit, clipping, tiling, and playback control.
---

`ImageBlock` and `VideoBlock` draw media onto the canvas. They share the same layout options, and each adds its own.

## Images

`ImageBlock` takes a `source`. It can be a URL, a path, or an `HTMLImageElement` you have already loaded.

```typescript


const photo = new ImageBlock({
  source: '/photos/beach.jpg',
  width: 320,
  height: 240,
});
```

> [!NOTE] A string source is loaded asynchronously
>
> When `source` is a string, the block creates an `HTMLImageElement` and sets its `src`. The image appears once it has loaded, and the block re-renders at that point. Nothing is drawn before then.

### A preloaded image

If you already have the image, pass a function that returns it. The function receives the block's current media element, which you can ignore or reuse.

```typescript
const img = new Image();
img.src = '/photos/beach.jpg';
await img.decode();

const photo = new ImageBlock({
  source: () => img,
  width: 320,
  height: 240,
});
```

> [!WARNING] The source must be a string or a function
>
> `ImageBlock` treats a non-string source as a factory function and calls it. Passing an `HTMLImageElement` directly will fail, because an element is not callable. Use `source: () => img`.

### A function that builds the image

The factory form is also the way to load the image yourself, which lets you react to the load.

```typescript
const photo = new ImageBlock({
  source: (current) => {
    const img = current ?? new Image();
    img.src = '/photos/beach.jpg';
    return img;
  },
  width: 320,
  height: 240,
});
```

> [!NOTE] The factory is called once, at init
>
> The returned element is kept as the block's media source. The block listens for the element's `load` event and re-renders when it fires, so an image that loads after the scene is built still appears.

## Object fit

`objectFit` controls how the media fills the block. It behaves like the CSS `object-fit` property.

| Value                    | Behaviour                                                      |
| ------------------------ | -------------------------------------------------------------- |
| `'scale-down'` (default) | Scales down to fit, but never scales up                        |
| `'contain'`              | Scales to fit entirely inside, leaving empty space             |
| `'cover'`                | Scales up to fill, cropping the overflow                       |
| `'fill'`                 | Stretches to fill the block exactly, ignoring the aspect ratio |

```typescript
const avatar = new ImageBlock({
  source: '/avatar.png',
  width: 64,
  height: 64,
  objectFit: 'cover',
});
```

> [!NOTE] scale-down is the default for a reason
>
> `'scale-down'` never enlarges a small image past its natural size, which keeps small icons crisp instead of blurring them. Use `'cover'` or `'fill'` when you want the media to fill the block regardless.

## Clipping

Four options select a region of the source image to draw.

| Option       | Type     | Default         | What it does                       |
| ------------ | -------- | --------------- | ---------------------------------- |
| `clipX`      | `number` | `0`             | The left edge of the source region |
| `clipY`      | `number` | `0`             | The top edge of the source region  |
| `clipWidth`  | `number` | the whole image | The width of the source region     |
| `clipHeight` | `number` | the whole image | The height of the source region    |

```typescript
const cropped = new ImageBlock({
  source: '/photos/wide.jpg',
  width: 200,
  height: 200,
  clipX: 100,
  clipY: 0,
  clipWidth: 200,
  clipHeight: 200,
  objectFit: 'cover',
});
```

> [!NOTE] Clipping and object fit work together
>
> `clip*` selects a region of the source. `objectFit` then decides how that region is fitted into the block.

## Tiling

`repeatX` and `repeatY` tile the image across the block.

| Value    | Behaviour                                     |
| -------- | --------------------------------------------- |
| A number | How many times the image repeats on that axis |
| `'fill'` | The image is drawn once, at its natural size  |

```typescript
const pattern = new ImageBlock({
  source: '/tiles/dot.png',
  width: 200,
  height: 200,
  repeatX: 4,
  repeatY: 4,
});
```

> [!WARNING] Tiling ignores objectFit
>
> When either `repeatX` or `repeatY` is set, the media is tiled and `objectFit` is not applied. The repeat count divides the block's size to work out the size of each tile.

## Video

`VideoBlock` takes an `HTMLVideoElement` as its source.

```typescript


const video = document.querySelector('video') as HTMLVideoElement;

const clip = new VideoBlock({
  source: video,
  width: 480,
  height: 270,
  autoPlay: true,
});
```

### Playback control

```typescript
clip.play();
clip.pause();

clip.isPlaying;   // boolean
clip.isPaused;    // boolean
```

### Autoplay and the play callback

`autoPlay` starts the video when the block is initialised. `onPlay` is called on every frame while the video is playing, with the frame timestamp.

```typescript
const clip = new VideoBlock({
  source: video,
  width: 480,
  height: 270,
  autoPlay: true,

  onPlay: (timestamp) => {
    console.log('frame at', timestamp);
  },
});
```

> [!NOTE] Videos are muted by default
>
> The block sets `muted = true` on the source element. Browsers block autoplay with sound, so the muted default is what makes `autoPlay` work reliably.

> [!WARNING] The video element must be in the document
>
> A detached `HTMLVideoElement` will not play or report dimensions. Keep the element in the DOM — hidden is fine — so the browser can decode it.

## Sharing the media options

Both blocks accept the same set of options.

| Option       | Type                                             | Default         |
| ------------ | ------------------------------------------------ | --------------- |
| `source`     | `string \| CanvasImageSource`                    | `undefined`     |
| `objectFit`  | `'contain' \| 'cover' \| 'fill' \| 'scale-down'` | `'scale-down'`  |
| `clipX`      | `number \| string`                               | `0`             |
| `clipY`      | `number \| string`                               | `0`             |
| `clipWidth`  | `number \| string`                               | the whole image |
| `clipHeight` | `number \| string`                               | the whole image |
| `repeatX`    | `number \| 'fill'`                               | `undefined`     |
| `repeatY`    | `number \| 'fill'`                               | `undefined`     |

Video blocks add two more:

| Option     | Type                          | Default     | What it does                       |
| ---------- | ----------------------------- | ----------- | ---------------------------------- |
| `autoPlay` | `boolean`                     | `false`     | Starts playback on initialisation  |
| `onPlay`   | `(timestamp: number) => void` | `undefined` | Called on each frame while playing |

## Other source types

`VideoBlock` accepts an `HTMLVideoElement` directly, and the media layout reads the dimensions of whatever it is given — `HTMLVideoElement`, `SVGImageElement`, `HTMLCanvasElement`, `ImageBitmap`, `OffscreenCanvas`, and `VideoFrame` are all handled.

`ImageBlock` is narrower: its source must be a string or a factory function that returns one of those.

> [!NOTE] Video frames and bitmaps work with VideoBlock
>
> A `VideoFrame` reports its size through `displayWidth` and `displayHeight`, and an `ImageBitmap` through `width` and `height`. Both are read correctly when the media is fitted.

## Next steps

- [Custom drawing](/docs/custom-drawing/) — draw images yourself with `drawImage`.
- [Transformation](/docs/transform/) — resize and rotate media.
- [Animation](/docs/animation/) — animate media properties.
