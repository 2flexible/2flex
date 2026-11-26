---
title: VideoBlock
description: Video playback drawn onto the canvas.
slug: video-block
---

# Class: VideoBlock\<T\>

A video that is played onto the canvas.

## Type Parameters

| Type Parameter                                                                            | Default type                                  |
| ----------------------------------------------------------------------------------------- | --------------------------------------------- |
| <a id="type-parameter-t"></a> `T` _extends_ [`VideoBlockOptions`](video-block-options.md) | [`VideoBlockOptions`](video-block-options.md) |

## Constructors

### Constructor

```ts
new VideoBlock<T>(options): VideoBlock<T>;
```

#### Parameters

| Parameter | Type                                          |
| --------- | --------------------------------------------- |
| `options` | [`VideoBlockOptions`](video-block-options.md) |

#### Returns

`VideoBlock`\<`T`\>

## Properties

### autoPlay

```ts
autoPlay: OptionAccessor<VideoBlockOptions, "autoPlay">;
```

---

### onPlay

```ts
onPlay: OptionAccessor<VideoBlockOptions, "onPlay">;
```

## Accessors

### isPlaying

#### Get Signature

```ts
get isPlaying(): boolean;
```

##### Returns

`boolean`

---

### isPaused

#### Get Signature

```ts
get isPaused(): boolean;
```

##### Returns

`boolean`

## Methods

### set()

```ts
set(options): void;
```

#### Parameters

| Parameter | Type |
| --------- | ---- |
| `options` | `T`  |

#### Returns

`void`

---

### init()

```ts
init(): void;
```

#### Returns

`void`

---

### pause()

```ts
pause(): void;
```

#### Returns

`void`

---

### play()

```ts
play(): void;
```

#### Returns

`void`
