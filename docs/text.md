---
id: text
title: Text
description: Draw and edit text on the canvas — fonts, wrapping, spacing, stroke, and in-canvas editing with a caret.
---

`TextBlock` renders text with the Canvas 2D text API, measures it precisely, and can be edited directly on the canvas.

```typescript


const label = new TextBlock({
  text: 'Hello 2flex',
  fontSize: 24,
  fontFamily: 'Inter, sans-serif',
  fontWeight: '600',
  color: '#0f172a',
});
```

## Fonts

| Option        | Type                                | Default        | What it does       |
| ------------- | ----------------------------------- | -------------- | ------------------ |
| `fontFamily`  | `string`                            | `'sans-serif'` | The font stack     |
| `fontSize`    | `number \| string`                  | `0`            | The size in pixels |
| `fontWeight`  | `string \| number`                  | `'normal'`     | The weight         |
| `fontStyle`   | `'normal' \| 'italic' \| 'oblique'` | `'normal'`     | The style          |
| `fontVariant` | `'normal' \| 'small-caps'`          | `'normal'`     | The variant        |

```typescript
const heading = new TextBlock({
  text: 'Section heading',
  fontSize: 32,
  fontFamily: 'Georgia, serif',
  fontWeight: 'bold',
  fontStyle: 'italic',
  fontVariant: 'small-caps',
});
```

> [!NOTE] Font sizes accept units
>
> `fontSize` is width-related, so it accepts a string with a unit — `'2rem'`, `'5%'` — as well as a number of pixels.

### Letter and word spacing

| Option          | Type               | Default | What it does                 |
| --------------- | ------------------ | ------- | ---------------------------- |
| `letterSpacing` | `number`           | `0`     | The space between letters    |
| `wordSpacing`   | `number`           | `0`     | The space between words      |
| `lineHeight`    | `number \| string` | `0`     | The height of a line of text |

`lineHeight` is a multiplier of the font size by default, but it also accepts a percentage string.

```typescript
const body = new TextBlock({
  text: 'Some body copy that needs a little more room between the lines.',
  fontSize: 16,
  lineHeight: 1.5,
  letterSpacing: 0.2,
});
```

> [!NOTE] lineHeight as a multiplier
>
> A `lineHeight` of `1.5` means one and a half times the font size. `'150%'` means the same thing. A value of `0` means the line height equals the font size.

## Wrapping

`wrap` controls how the text breaks when it is wider than the block.

| Value                | Behaviour                                       |
| -------------------- | ----------------------------------------------- |
| `'nowrap'` (default) | The text never wraps and may overflow the block |
| `'word'`             | Breaks at word boundaries                       |
| `'letter'`           | Breaks between any two characters               |

```typescript
const paragraph = new TextBlock({
  text: 'A long paragraph that will wrap when it reaches the edge of the block.',
  fontSize: 14,
  wrap: 'word',
  width: 280,
});
```

> [!WARNING] The block does not grow to fit the text
>
> Wrapping keeps the text inside the block's width, but the block's height stays whatever you set it to. If the text is taller than the block, it overflows vertically. Measure the text and set the height yourself if you need it to fit.

## Colour and stroke

`color` fills the text. `strokeColor` and `strokeWidth` outline it.

```typescript
const outlined = new TextBlock({
  text: 'Outlined',
  fontSize: 40,
  color: '#ffffff',
  strokeColor: '#1e293b',
  strokeWidth: 2,
});
```

## The text context options

`TextBlock` inherits the Canvas 2D text options from `ShapeBlock`.

| Option            | Type                    | What it does               |
| ----------------- | ----------------------- | -------------------------- |
| `textAlign`       | `CanvasTextAlign`       | The horizontal alignment   |
| `textBaseline`    | `CanvasTextBaseline`    | The vertical alignment     |
| `direction`       | `CanvasDirection`       | The text direction         |
| `fontKerning`     | `CanvasFontKerning`     | Whether kerning is applied |
| `fontStretch`     | `CanvasFontStretch`     | The width of the glyphs    |
| `fontVariantCaps` | `CanvasFontVariantCaps` | How capitals are rendered  |
| `textRendering`   | `CanvasTextRendering`   | The rendering hint         |
| `wordSpacing`     | `number`                | The space between words    |
| `letterSpacing`   | `number`                | The space between letters  |

## Measuring text

`measureText` returns the standard `TextMetrics` object.

```typescript
const metrics = label.measureText('Hello 2flex');

metrics.width;                    // the advance width
metrics.actualBoundingBoxAscent;  // the height above the baseline
metrics.actualBoundingBoxDescent; // the height below the baseline
```

> [!NOTE] Measuring works before the block is on screen
>
> The text is measured against an offscreen canvas, so `measureText` returns a usable result even before the block has been added to a scene.

## Editing text on the canvas

Set `editable: true` and the user can double-click to edit the text in place, with a caret, a selection, and clipboard support.

```typescript
const note = new TextBlock({
  text: 'Double-click to edit',
  fontSize: 18,
  editable: true,
  width: 300,
  wrap: 'word',

  onEditable: (block) => {
    console.log('the text is now:', block.text());
  },
});
```

`onEditable` fires whenever the text changes.

### What the user can do

| Action                         | Result                                    |
| ------------------------------ | ----------------------------------------- |
| Double-click                   | Enters edit mode and selects all the text |
| Click and drag                 | Selects a range of characters             |
| <kbd>Ctrl</kbd>+<kbd>A</kbd>   | Selects all                               |
| <kbd>Ctrl</kbd>+<kbd>C</kbd>   | Copies the selection                      |
| <kbd>Ctrl</kbd>+<kbd>X</kbd>   | Copies and deletes the selection          |
| <kbd>Ctrl</kbd>+<kbd>V</kbd>   | Pastes at the caret                       |
| <kbd>Backspace</kbd>           | Deletes backwards                         |
| <kbd>Delete</kbd>              | Deletes forwards                          |
| <kbd>Enter</kbd>               | Inserts a newline                         |
| <kbd>Tab</kbd>                 | Inserts four spaces                       |
| <kbd>←</kbd> <kbd>→</kbd>      | Moves the caret                           |
| <kbd>↑</kbd> <kbd>↓</kbd>      | Moves the caret between lines             |
| <kbd>Home</kbd> <kbd>End</kbd> | Moves to the start or end of the line     |
| <kbd>Shift</kbd> + arrows      | Extends the selection                     |
| <kbd>Escape</kbd>              | Exits edit mode                           |

> [!NOTE] Editing needs focus
>
> Keyboard editing only works when the canvas has DOM focus, and the key events are consumed so the page does not scroll while typing.

### The caret

A blinking caret is drawn at the selection while the text is editable. It is a built-in animation that runs only while the block is in edit mode.

`caret` toggles it on and off.

```typescript
const note = new TextBlock({
  text: 'No caret here',
  editable: true,
  caret: false,
});
```

> [!NOTE] The caret is drawn over the selection highlight
>
> The caret is only visible when there is no active selection. As soon as the user selects a range, the selection highlight replaces it.

## The selection highlight

While text is selected, the range is highlighted with a translucent blue rectangle behind it. The colour is fixed.

## Setting the text

You can set the text at any time.

```typescript
note.text('Updated text');
```

> [!WARNING] Use set() to record the change
>
> Writing `note.text('...')` directly updates the value but does not mark the block for redraw. Use `note.set({ text: 'Updated text' })` to update it, re-render it, and record an undo step.

## Next steps

- [Media](/docs/media/) — images and video.
- [Custom drawing](/docs/custom-drawing/) — the full Canvas 2D option surface.
- [Events](/docs/events/) — handle clicks on text.
