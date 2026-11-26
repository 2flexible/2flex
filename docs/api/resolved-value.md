---
title: ResolvedValue
description: The `ResolvedValue` API of the 2flex library.
slug: resolved-value
---

# Type Alias: ResolvedValue\<T\>

```ts
type ResolvedValue<T> = T extends unknown ? IsAny<T> extends true ? any : T extends {
  __resolvedAs?: infer R;
} ? R : ResolvedMember<T> : never;
```

## Type Parameters

| Type Parameter                    |
| --------------------------------- |
| <a id="type-parameter-t"></a> `T` |
