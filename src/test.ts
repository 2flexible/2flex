interface NodeProps {
    child_nodes: Node[];
    next: Node | undefined;
    addChild(node: Node[]): void;
    data: number;
}

export class Node implements NodeProps {
    child_nodes: Node[];
    next: undefined | Node;
    data: number;
    constructor(data: number) {
        this.child_nodes = [];
        this.next = undefined;
        this.data = data;
    }

    addChild(node: Node[]) {
        this.next = node.shift();
        this.child_nodes.push(...node);
    }
}

export class Tree {
    #nodes: Node[];
    #head: Node;

    constructor() {
        this.#nodes = [];
        this.#head = new Node(0);
    }

    addNode(node: Node[]) {
        if (this.#head.next === undefined) {
            this.#head.addChild(node);
        }
        this.#nodes.push(...node);
    }

    pre_order_traversal() {
        const Q = [];
        Q.push(this.#head);

        const S = [];

        while (Q.length > 0) {
            let current: Node | undefined = Q.shift();
            console.log(Q);

            S.push(current);

            if (current?.child_nodes) {
                Q.unshift(...current.child_nodes);
            }

            if (current?.next) {
                Q.unshift(current.next);
            }
        }

        while (S.length > 0) {
            let curr: any = S.shift();
            console.log(curr.data);
        }
    }
}

const node1 = new Node(1);
const node2 = new Node(2);
const node3 = new Node(3);

const node4 = new Node(4);
const node5 = new Node(5);
const node6 = new Node(6);

const node7 = new Node(7);
const node8 = new Node(8);

const node9 = new Node(9);
const node10 = new Node(10);

const tree = new Tree();

node1.addChild([node4, node5, node6]);

node2.addChild([node7, node8]);

const node11 = new Node(11);
const node12 = new Node(12);
const node13 = new Node(13);

const node22 = new Node(22);
const node24 = new Node(24);

node5.addChild([node11, node12, node13]);
node6.addChild([node22, node24]);

node3.addChild([node9, node10]);

tree.addNode([node1, node2, node3]);

tree.pre_order_traversal();

/* 
          0
        | | |
        1 2 3
    4 5 6
*/
