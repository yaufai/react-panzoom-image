import { Component } from "react";
import { Viewbox, SimpleViewbox } from "./domains/Viewbox";
import { getNullableDistance, getCenter, getStringRepr, Point, PointOnPage, getOnly, extractPurePoint } from "./domains/Point";
import ReactDOM from "react-dom";
import { classifyTouchEvent, TouchEventType } from "./EventUtils/TouchEventClassifier";
import React from "react";

type PanZoomableViewboxProps = {
    svg      : any,
    width    : number,
    height   : number,
    minx     : number,
    miny     : number,
    verbose? : boolean
}

type PanZoomableViewboxState = {
    viewboxConfig: Viewbox
    distance     : number | null
    curEventType : TouchEventType | null
    refViewbox   : Viewbox
    refPoint     : Point
}

export class PanZoomableViewbox extends Component<PanZoomableViewboxProps, PanZoomableViewboxState> {
    constructor(props: PanZoomableViewboxProps) {
        super(props)
        let initViewbox = new SimpleViewbox(
            this.props.width,
            this.props.height,
            this.props.minx,
            this.props.miny
        )
        this.state = {
            distance: null,
            viewboxConfig: initViewbox,
            curEventType : null,
            refViewbox   : initViewbox,
            refPoint     : { x: 0, y: 0 }
        }
        this.pinch = this.pinch.bind(this)
        this.scale = this.scale.bind(this)
        this.pan   = this.pan.bind(this)
        this.swipe = this.swipe.bind(this)
        this.ontouchmove   = this.ontouchmove.bind(this)
        this.becomeNeutral = this.becomeNeutral.bind(this)
    }

    scale(scaler: number, center: Point) {
        this.log("Scaling...:\n * scaler: " + scaler.toString() + "\n * center: " + getStringRepr(center))
        this.setState({
            distance: this.state.distance,
            viewboxConfig: this.state.refViewbox.scale(scaler, center)
        })
        this.log("Scaled:\n * viewBox: " + this.state.viewboxConfig.scale(scaler, center).encode())
    }

    pan(dx: number, dy: number) {
        this.log("Panning...:\n * delta: (" + dx.toString() + ", " + dy.toString() + ")")
        let newViewbox = this.state.refViewbox.pan(dx, dy)
        this.setState({
            distance: this.state.distance,
            viewboxConfig: newViewbox
        })
        this.log("Panned:\n * viewBox: " + newViewbox.encode())
    }

    pinch(e: any) {
        if (e.cancellable) {
            e.preventDefault()
        }
        // 距離は平行移動で変化しないのでここのTouchは要素上の座標に変換しなくて良い
        let distance = getNullableDistance(e.changedTouches)
        if (this.state.distance != null) {
            this.log("Pinch:\n * distance: " + distance?.toString())
            let scale  = distance ? this.state.distance / distance : 1
            let center = getCenter(e.changedTouches)
            this.scale(scale, center)
        } else {
            this.setState({
                distance: distance,
                viewboxConfig: this.state.viewboxConfig
            })
        }
    }

    startPinch(e: any) {
        if (e.cancellable) {
            e.preventDefault()
        }
        let distance = getNullableDistance(e.changedTouches)
        this.log("Detected pinch start:\n * init distance: " + distance?.toString() + "\n * viewBox: " + this.state.viewboxConfig.encode())
        this.setState({
            distance: distance,
            refViewbox   : this.state.viewboxConfig,
            curEventType : TouchEventType.Pinch
        })
    }

    swipe(e: any) {
        if (e.cancellable) {
            e.preventDefault()
        }
        let point = getOnly(e.changedTouches)
        let px    = extractPurePoint(this.state.refPoint)
        this.pan(px.x - point.x, px.y - point.y)
    }

    startSwipe(e: any) {
        let point = getOnly(e.changedTouches)
        this.setState({
            curEventType: TouchEventType.Swipe,
            refViewbox  : this.state.viewboxConfig,
            refPoint: point
        })
        this.log("Detected swipe start:\n * init point: " + getStringRepr(point))
    }

    becomeNeutral() {
        this.setState({
            distance: null,
            curEventType : null,
            refViewbox   : this.state.viewboxConfig,
            viewboxConfig: this.state.viewboxConfig
        })
    }

    ontouchmove(e: any) {
        let newEventType = classifyTouchEvent(e)
        this.log("Event detect: " + newEventType)
        if (newEventType === TouchEventType.Pinch) {
            if (this.state.curEventType === TouchEventType.Pinch) {
                this.pinch(e)
            } else {
                this.becomeNeutral()
                this.startPinch(e)
            }
        } else {
            if (this.state.curEventType === TouchEventType.Swipe) {
                this.swipe(e)
            } else {
                this.becomeNeutral()
                this.startSwipe(e)
            }
        }
    }

    render() {
        let newProps = { viewBox: this.state.viewboxConfig.encode() }
        let clone = React.cloneElement(this.props.svg, newProps)
        return clone
    }

    componentDidMount() {
        [
            { type: "touchmove", func: this.ontouchmove   },
            { type: "touchend" , func: this.becomeNeutral }
        ].forEach((tuple) => { 
            ReactDOM.findDOMNode(this)?.addEventListener(tuple.type, tuple.func, { passive: false })
        })
    }

    log(message: any) {
        if (this.props.verbose) {
            console.log(message)
        }
    }

    getBoundingRect(): DOMRect {
        return this.props.svg.getBoundingClientRect();
    }
}