"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDragState = exports.useEventListener = void 0;
const React = require("react");
const ReactDOM = require("react-dom");
const { useCallback, useMemo, useState, useEffect } = React;
function useEventListener(type, listener) {
    useEffect(() => {
        if (!listener)
            return;
        document.addEventListener(type, listener);
        return () => {
            document.removeEventListener(type, listener);
        };
    }, [type, listener]);
}
exports.useEventListener = useEventListener;
function useDragStateHandlers(split, onDragFinished) {
    const [dragging, setDragging] = useState(null);
    const [current, setCurrent] = useState(0);
    const beginDrag = useCallback((event, extraState) => {
        const pos = split === 'vertical' ? event.clientX : event.clientY;
        setDragging([extraState, pos]);
        setCurrent(pos);
    }, [split]);
    const [dragState, onMouseUp] = useMemo(() => {
        if (!dragging) {
            return [null, undefined];
        }
        const [extraState, origin] = dragging;
        const dragState = { offset: current - origin, extraState };
        const onMouseUp = () => {
            ReactDOM.unstable_batchedUpdates(() => {
                setDragging(null);
                onDragFinished(dragState);
            });
        };
        return [dragState, onMouseUp];
    }, [current, dragging, onDragFinished]);
    const [onMouseMove, onTouchMove] = useMemo(() => {
        if (!dragging) {
            return [undefined, undefined];
        }
        const onMouseMove = (event) => {
            const pos = split === 'vertical' ? event.clientX : event.clientY;
            setCurrent(pos);
        };
        const onTouchMove = (event) => {
            onMouseMove(event.touches[0]);
        };
        return [onMouseMove, onTouchMove];
    }, [dragging, split]);
    return { beginDrag, dragState, onMouseMove, onTouchMove, onMouseUp };
}
function useDragState(split, onDragFinished) {
    const { beginDrag, dragState, onMouseMove, onTouchMove, onMouseUp } = useDragStateHandlers(split, onDragFinished);
    useEventListener('mousemove', onMouseMove);
    useEventListener('touchmove', onTouchMove);
    useEventListener('mouseup', onMouseUp);
    return [dragState, beginDrag];
}
exports.useDragState = useDragState;
//# sourceMappingURL=util.js.map