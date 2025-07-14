class MyClass {
    constructor(text) {
        this.text = text;
    }
    add() {
        console.log("hey");
    }
}

// MyClass.prototype.add =
console.log(Object.getOwnPropertyDescriptor(MyClass.prototype, "add").value());

console.log(MyClass.prototype);
console.log(Reflect.getPrototypeOf(new MyClass()));
console.log(Object.getPrototypeOf(new MyClass()));
console.log(Object.getOwnPropertyNames(MyClass.prototype));
