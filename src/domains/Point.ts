export interface PointOnPage {
    pageX: number
    pageY: number
}

export class PurePoint {
    x: number
    y: number
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

export type Point = PointOnPage | PurePoint

export function mapToPointOnElement(x: Point, rect: DOMRect): PurePoint {
    let px = extractPurePoint(x)
    return new PurePoint(px.x - rect.x, px.y - rect.y)
}

export function extractPurePoint(x: Point): PurePoint {
    if (x instanceof PurePoint) {
        return x
    } else {
        return new PurePoint(x.pageX, x.pageY)
    }
}

function getDistance(x: Point, y: Point): number {
    let px = extractPurePoint(x)
    let py = extractPurePoint(y)
    return Math.sqrt(
        Math.pow(px.x - py.x, 2) + Math.pow(px.y - py.y, 2)
    )
}

class MissingPointsError extends Error {
    constructor(e?: string) {
        super(e)
        this.name = new.target.name
    }
}

export function getOnly(xs: Point[]): PurePoint {
    return extractPurePoint(xs[0])
}

function pickTwoPurePoints(xs: Point[]): PurePoint[] {
    if (xs.length >= 2) {
        return [xs[0], xs[1]].map(extractPurePoint)
    } else {
        throw new MissingPointsError()
    }
}

export function getNullableDistance(xs: Point[]): number | null {
    try {
        let twoPoints = pickTwoPurePoints(xs)
        return getDistance(twoPoints[0], twoPoints[1])
    } catch (e) {
        if (e instanceof MissingPointsError) {
            return null
        } else {
            throw e
        }
    }
}

export function getCenter(xs: Point[]): PurePoint {
    let twoPoints = pickTwoPurePoints(xs)
    return new PurePoint(
        0.5 * (twoPoints[0].x + twoPoints[1].x),
        0.5 * (twoPoints[0].y + twoPoints[1].y)
    )
}

export function getCenterOnElement(xs: Point[], rect: DOMRect): PurePoint {
    let twoPoints = pickTwoPurePoints(xs)
        .map((px) => mapToPointOnElement(px, rect))
    return new PurePoint(
        0.5 * (twoPoints[0].x + twoPoints[1].x),
        0.5 * (twoPoints[0].y + twoPoints[1].y)
    )
}

export function getStringRepr(x: Point): string {
    let px = extractPurePoint(x)
    return "(" + px.x.toString() + ", " + px.y.toString() + ")"
}