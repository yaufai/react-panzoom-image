import { TouchEvent } from "react";

export enum TouchEventType {
    Swipe = "SwipeByTouch",
    Pinch = "PinchByTouch"
}

export function classifyTouchEvent(e: TouchEvent): TouchEventType {
    if (e.changedTouches.length === 1) {
        return TouchEventType.Swipe
    } else {
        return TouchEventType.Pinch
    }
}