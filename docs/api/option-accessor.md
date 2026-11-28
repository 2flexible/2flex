---
title: OptionAccessor
description: The `OptionAccessor` API of the 2flex library.
slug: option-accessor
---

# Type Alias: OptionAccessor\<O, K\>

```ts
type OptionAccessor<O, K> = {
  (): ResolvedValue<NonNullable<O[K]>>;
  (value): ResolvedValue<NonNullable<O[K]>>;
};
```

## Type Parameters

| Type Parameter                                        |
| ----------------------------------------------------- |
| <a id="type-parameter-o"></a> `O`                     |
| <a id="type-parameter-k"></a> `K` _extends_ keyof `O` |

## Call Signature

```ts
(): ResolvedValue<NonNullable<O[K]>>;
```

### Returns

[`ResolvedValue`](resolved-value.md)\<`NonNullable`\<`O`\[`K`\]\>\>

## Call Signature

```ts
(value): ResolvedValue<NonNullable<O[K]>>;
```

### Parameters

| Parameter | Type                                                                                                                                                                 |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`   | `undefined` _extends_ [`ResolvedValue`](resolved-value.md)\<`NonNullable`\<`O`\[`K`\]\>\> ? `NonNullable`\<`O`\[`K`\]\> \| `undefined` : `NonNullable`\<`O`\[`K`\]\> |

### Returns

[`ResolvedValue`](resolved-value.md)\<`NonNullable`\<`O`\[`K`\]\>\>
