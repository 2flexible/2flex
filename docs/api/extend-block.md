---
title: extend-block
description: The `extend-block` API of the 2flex library.
slug: extend-block
---

# Function: extendBlock()

```ts
function extendBlock<TOptions>(): <TBase>(BaseClass) => (new (options) => InstanceType<TBase> & {
  set(options): void;
} & OwnOptionAccessors<TOptions, BlockOptionsOf<InstanceType<TBase>>>) & Omit<TBase, "prototype">;
```

Adds the typed option accessors and the method `set` to a block class.

## Type Parameters

| Type Parameter                                                               |
| ---------------------------------------------------------------------------- |
| <a id="type-parameter-toptions"></a> `TOptions` _extends_ `BaseBlockOptions` |

## Returns

A function that takes the class and returns it with the accessors.

\<`TBase`\>(`BaseClass`) => (new (`options`) => `InstanceType`\<`TBase`\> & \{
`set`(`options`): `void`;
\} & [`OwnOptionAccessors`](own-option-accessors.md)\<`TOptions`, [`BlockOptionsOf`](block-options-of.md)\<`InstanceType`\<`TBase`\>\>\>) & `Omit`\<`TBase`, `"prototype"`\>
