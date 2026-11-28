---
id: video
title: Video
description: The VideoBlock — playback control, autoplay, and the media layout options.
---

`VideoBlock` plays a video on the canvas. It takes an `HTMLVideoElement` as its source and exposes playback controls.

```javascript


const video = document.createElement('video');
video.src = '/clip.mp4';
video.autoplay = true;

const block = new VideoBlock({
  source: video,
  width: 400,
  height: 500,
});
```

> [!NOTE]
>
> The video element must be loaded before the block can draw a frame. Give it time to reach `readyState >= 2`, or listen for the `canplay` event before adding the block to the canvas.

## Playback control

```javascript
block.play();
block.pause();
```

The underlying element is available if you need direct access.

```javascript
block.source().play();
```

## Autoplay

The `autoPlay` option starts playback as soon as the block is added.

```javascript
const block = new VideoBlock({
  source: video,
  width: 400,
  height: 300,
  autoPlay: true,
});
```

| Option     | Type      | Default |
| ---------- | --------- | ------- |
| `autoPlay` | `boolean` | `false` |

## Playback events

The `onPlay` callback fires when the video starts playing.

```javascript
const block = new VideoBlock({
  source: video,
  width: 400,
  height: 300,
  onPlay: (event) => {
    console.log('playing');
  },
});
```

## Media layout options

`VideoBlock` inherits the media layout options — clipping, object fit, and repetition.

```javascript
const block = new VideoBlock({
  source: video,
  width: 400,
  height: 300,
  objectFit: 'cover',
  clipX: 0,
  clipY: 0,
  clipWidth: 100,
  clipHeight: 100,
});
```

## Reference

- [VideoBlock API](/api/video-block)
- [Media layout options](/api/image-block) — shared with `ImageBlock`
