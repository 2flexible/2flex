const obj = [{ options: { first: "hey" } }];

const new_obj = obj.filter((item) => {
    if (Object.values(item.options).includes("hey")) {
        return item;
    }
});
console.log(new_obj);

if ("hey" === Object.values(obj[0])) {
    console.log("exitts");
}
