---
title: ResolvedAs
description: The `ResolvedAs` API of the 2flex library.
slug: resolved-as
---

# Type Alias: ResolvedAs\<Raw, Resolved\>

```ts
type ResolvedAs<Raw, Resolved> = Raw & {
  __resolvedAs?: Resolved;
};
```

## Type Parameters

| Type Parameter                                  | Default type |
| ----------------------------------------------- | ------------ |
| <a id="type-parameter-raw"></a> `Raw`           | -            |
| <a id="type-parameter-resolved"></a> `Resolved` | `Raw`        |

## Type Declaration

### \_\_resolvedAs?

```ts
readonly __resolvedAs?: Resolved;
```
