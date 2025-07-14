import { Block } from ".";
import { Rect } from "./shapes/Rect";
import { BlockElements } from "./types";

interface NodeProps {
    child_nodes: Node[];
    next: Node | undefined;
    addChild(node: Node): void;
}

export class Node implements NodeProps {
    child_nodes: Node[];
    next: undefined | Node;

    constructor() {
        this.child_nodes = [];
        this.next = undefined;
    }

    addChild(...node: Node[]) {
        this.child_nodes.push(...node);
        this.next = this.child_nodes.pop();
    }
}

export class Tree {
    #nodes: Node[];
    #head: Node | undefined;
    constructor() {
        this.#nodes = [];
        this.#head = undefined;
    }

    addNode(...node: Node[]) {
        if (this.#head === undefined) {
            this.#head == node;
        }
        this.#nodes.push(...node);
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

// const rect = new Rect({200, 400});
// const block1 = new Block(rect);
// const node1 = new Node(block1);

// const block2 = new Block("Shape");

// const block9 = new Block("Differnet Kind");

// const node2 = new Node(block2);
// const node3 = new Node(block2);
// const node4 = new Node(block9);

// const node5 = new Node(block2);

// const tree = new Tree();

// node1.add(node2);
// node1.add(node3);
// node1.add(node4);

// node5.add(node2);

// tree.add(node1);
// tree.add(node5);

// tree.traversal();
