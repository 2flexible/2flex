---
title: OptionAccessors
description: The `OptionAccessors` API of the 2flex library.
slug: option-accessors
---

# Type Alias: OptionAccessors\<O\>

```ts
type OptionAccessors<O> = { [K in keyof O]-?: OptionAccessor<O, K> };
```

## Type Parameters

| Type Parameter                    |
| --------------------------------- |
| <a id="type-parameter-o"></a> `O` |
