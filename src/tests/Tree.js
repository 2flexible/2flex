"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
class Node {
    child_nodes;
    block;
    next;
    constructor(block) {
        this.child_nodes = [];
        this.block = block;
        this.next = undefined;
    }
    add(node) {
        this.child_nodes.push(node);
        this.next = node;
    }
}
class Tree {
    #nodes;
    #head;
    constructor() {
        this.#nodes = [];
        this.#head = undefined;
    }
    add(node) {
        if (this.#head === undefined) {
            this.#head == node;
        }
        this.#nodes.push(node);
    }
    traversal() {
        const depth = this.#nodes.length;
        let i = 0;
        while (i < depth) {
            let node = this.#nodes[i];
            if (node.next !== undefined) {
                console.log(node);
            }
            i++;
        }
    }
}
const block1 = new _1.Block("Text");
const node1 = new Node(block1);
const block2 = new _1.Block("Shape");
const block9 = new _1.Block("Differnet Kind");
const node2 = new Node(block2);
const node3 = new Node(block2);
const node4 = new Node(block9);
const node5 = new Node(block2);
const tree = new Tree();
node1.add(node2);
node1.add(node3);
node1.add(node4);
node5.add(node2);
tree.add(node1);
tree.add(node5);
tree.traversal();
