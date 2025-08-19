export class Path extends Path2D {
    path: Path2D;

    constructor(path?: any) {
        super(path);
        this.path = new Path2D(path);
    }

    addBackgroundPath(width: number, height: number) {
        this.path.rect(0, 0, width, height);
    }
    addRect(
        x: number,
        y: number,
        width: number,
        height: number,
        borderRadius?: number
    ) {
        this.path.roundRect(x, y, width, height, borderRadius);
    }
    lineTo(x: number, y: number): void {
        this.path.lineTo(x, y);
    }
    createPath(path?: any) {
        this.path = new Path2D(path);
    }
    // @todo: svg to path convert
    // @todo: custom paths
}
