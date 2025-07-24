console.log(Object.entries({ first: "last" }));
const arr = [
    { type: 1, missing: "first" },
    { type: 1, missing: "first" },
    { type: 2, missing: "second" },
];

let uniqeEvents = [];

for (const item of arr) {
    const tempUniqe = uniqeEvents?.filter((_item) => _item.type === item.type);
    if (tempUniqe[0]) {
        const idx = uniqeEvents.indexOf(tempUniqe[0]);
        uniqeEvents.splice(idx, 1);
        tempUniqe[0].missing.push(item.missing);
        uniqeEvents = [...uniqeEvents, tempUniqe[0]];
    } else {
        uniqeEvents.push({ type: item.type, missing: [item.missing] });
    }
}
console.log(uniqeEvents);
