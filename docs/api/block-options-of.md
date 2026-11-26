---
title: BlockOptionsOf
description: The `BlockOptionsOf` API of the 2flex library.
slug: block-options-of
---

# Type Alias: BlockOptionsOf\<B\>

```ts
type BlockOptionsOf<B> = B extends BaseBlock<infer O> ? O : BaseBlockOptions;
```

## Type Parameters

| Type Parameter                    |
| --------------------------------- |
| <a id="type-parameter-b"></a> `B` |
