---
title: OwnOptionAccessors
description: The `OwnOptionAccessors` API of the 2flex library.
slug: own-option-accessors
---

# Type Alias: OwnOptionAccessors\<O, Base\>

```ts
type OwnOptionAccessors<O, Base> = { [K in Exclude<keyof O, keyof Base>]-?: OptionAccessor<O, K> };
```

## Type Parameters

| Type Parameter                          |
| --------------------------------------- |
| <a id="type-parameter-o"></a> `O`       |
| <a id="type-parameter-base"></a> `Base` |
