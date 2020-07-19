import { Point, extractPurePoint } from "./Point";

export interface ElementWithViewbox {
    viewBox: string
}

export interface Viewbox {
    width : number;
    height: number;
    minx  : number;
    miny  : number;
    encode: () => string
    scale : (scaler: number, center: Point) => Viewbox
    pan   : (dx: number, dy: number) => Viewbox
}

export class SimpleViewbox {
    width : number;
    height: number;
    minx  : number;
    miny  : number;

    constructor(width: number, height: number, minx: number, miny: number) {
        this.width  = width
        this.height = height
        this.minx   = minx
        this.miny   = miny
    }
    
    scale(scaler: number, center: Point): SimpleViewbox {
        let pcenter = extractPurePoint(center)
        return new SimpleViewbox(
            scaler * this.width,
            scaler * this.height,
            (1-scaler) * pcenter.x + scaler * this.minx,
            (1-scaler) * pcenter.y + scaler * this.miny
        )
    }

    pan(dx: number, dy: number): SimpleViewbox {
        return new SimpleViewbox(
            this.width,
            this.height,
            this.minx + dx,
            this.miny + dy
        )
    }

    encode(): string {
        let sep = " "
        return this.minx.toString() + sep + this.miny.toString() + sep + this.width.toString() + sep + this.height.toString()
    }
}
