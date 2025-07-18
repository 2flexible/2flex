// import { Canvas, Page, Block } from "./index";
// import { Rect } from "./shapes/index";

// const canvas = new Canvas(200, 200);

// const layer = new Page(300, 300);

// const block = new Block();

// // const rect = new Rect();

// canvas.add(layer);

// // block.add(rect);

// layer.add(block);
class Test1 {
    worlds = "earth";
    constructor() {}
    call_it() {
        // console.log(Object.getOwnPropertyNames(Test1));
        const test12 = new Test2();
        console.log(
            Object.getOwnPropertyDescriptor(Test2.prototype, "_private_method")
        );

        // console.log(
        //     Object.getOwnPropertyDescriptor(Test2.prototype, "private_method")
        // );
    }
}

class Test2 extends Test1 {
    constructor() {
        super();
    }
    _private_method() {
        console.log(this.worlds);
        return this.worlds;
    }

    private private_method1() {}
}
const test11 = new Test1().call_it();
const test12 = new Test2();
