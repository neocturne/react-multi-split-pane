"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitPane = void 0;
const React = require("react");
const { useCallback, useRef, useState, useMemo, useEffect } = React;
const Pane_1 = require("./Pane");
const Resizer_1 = require("./Resizer");
const util_1 = require("./util");
const DEFAULT_MIN_SIZE = 50;
function getNodeKey(node, index) {
    if (typeof node === 'object' && node && node.key != null) {
        return 'key.' + node.key;
    }
    return 'index.' + index;
}
function getMinSize(index, minSizes) {
    if (typeof minSizes === 'number') {
        if (minSizes > 0) {
            return minSizes;
        }
    }
    else if (minSizes instanceof Array) {
        const value = minSizes[index];
        if (value > 0) {
            return value;
        }
    }
    return DEFAULT_MIN_SIZE;
}
function getDefaultSize(index, defaultSizes) {
    if (defaultSizes) {
        const value = defaultSizes[index];
        if (value >= 0) {
            return value;
        }
    }
    return 1;
}
function move(sizes, index, offset, minSizes) {
    if (!offset || index < 0 || index + 1 >= sizes.length) {
        return 0;
    }
    const firstMinSize = getMinSize(index, minSizes);
    const secondMinSize = getMinSize(index + 1, minSizes);
    const firstSize = sizes[index] + offset;
    const secondSize = sizes[index + 1] - offset;
    if (offset < 0 && firstSize < firstMinSize) {
        // offset is negative, so missing and pushed are, too
        const missing = firstSize - firstMinSize;
        const pushed = move(sizes, index - 1, missing, minSizes);
        offset -= missing - pushed;
    }
    else if (offset > 0 && secondSize < secondMinSize) {
        const missing = secondMinSize - secondSize;
        const pushed = move(sizes, index + 1, missing, minSizes);
        offset -= missing - pushed;
    }
    sizes[index] += offset;
    sizes[index + 1] -= offset;
    return offset;
}
const defaultProps = {
    split: 'vertical',
    className: '',
};
function useSplitPaneResize(options) {
    const { children, split, defaultSizes, minSize: minSizes, onDragStarted, onChange, onDragFinished } = options;
    const [sizes, setSizes] = useState(new Map());
    const paneRefs = useRef(new Map());
    const getMovedSizes = useCallback((dragState) => {
        const collectedSizes = children.map((node, index) => sizes.get(getNodeKey(node, index)) || getDefaultSize(index, defaultSizes));
        if (dragState) {
            const { offset, extraState: { index }, } = dragState;
            move(collectedSizes, index, offset, minSizes);
        }
        return collectedSizes;
    }, [children, defaultSizes, minSizes, sizes]);
    const handleDragFinished = useCallback((dragState) => {
        const movedSizes = getMovedSizes(dragState);
        setSizes(new Map(children.map((node, index) => [
            getNodeKey(node, index),
            movedSizes[index],
        ])));
        if (onDragFinished) {
            onDragFinished(movedSizes);
        }
    }, [children, getMovedSizes, onDragFinished]);
    const [dragState, beginDrag] = (0, util_1.useDragState)(split, handleDragFinished);
    const movedSizes = useMemo(() => getMovedSizes(dragState), [dragState, getMovedSizes]);
    const resizeState = dragState ? dragState.extraState : null;
    useEffect(() => {
        if (onChange && dragState) {
            onChange(movedSizes);
        }
    }, [dragState, movedSizes, onChange]);
    const childPanes = useMemo(() => {
        const prevPaneRefs = paneRefs.current;
        paneRefs.current = new Map();
        return children.map((node, index) => {
            const key = getNodeKey(node, index);
            const ref = prevPaneRefs.get(key) || React.createRef();
            paneRefs.current.set(key, ref);
            const minSize = getMinSize(index, minSizes);
            return { key, node, ref, minSize };
        });
    }, [children, minSizes]);
    const childPanesWithSizes = useMemo(() => childPanes.map((child, index) => {
        const size = movedSizes[index];
        return Object.assign(Object.assign({}, child), { size });
    }), [childPanes, movedSizes]);
    const handleDragStart = useCallback((index, pos) => {
        const sizeAttr = split === 'vertical' ? 'width' : 'height';
        const clientSizes = new Map(childPanes.map(({ key, ref }) => {
            const size = ref.current ? ref.current.getBoundingClientRect()[sizeAttr] : 0;
            return [key, size];
        }));
        if (onDragStarted) {
            onDragStarted();
        }
        beginDrag(pos, { index });
        setSizes(clientSizes);
    }, [beginDrag, childPanes, onDragStarted, split]);
    return { childPanes: childPanesWithSizes, resizeState, handleDragStart };
}
exports.SplitPane = React.memo((props) => {
    const options = Object.assign(Object.assign({}, defaultProps), props);
    const { split, className, resizerClassName, resizerStyle } = options;
    const { childPanes, resizeState, handleDragStart } = useSplitPaneResize(options);
    const splitStyleProps = split === 'vertical'
        ? {
            left: 0,
            right: 0,
            flexDirection: 'row',
        }
        : {
            bottom: 0,
            top: 0,
            flexDirection: 'column',
            minHeight: '100%',
            width: '100%',
        };
    const style = Object.assign({ display: 'flex', flex: 1, height: '100%', position: 'absolute', outline: 'none', overflow: 'hidden' }, splitStyleProps);
    const classes = ['SplitPane', split, className].join(' ');
    const dragLayerStyle = {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    };
    const dragLayerClasses = ['DragLayer', split, resizeState ? 'resizing' : '', className].join(' ');
    const entries = [];
    childPanes.forEach(({ key, node, ref, size, minSize }, index) => {
        if (index !== 0) {
            const resizing = resizeState && resizeState.index === index - 1;
            entries.push(React.createElement(Resizer_1.Resizer, { key: 'resizer.' + index, split: split, style: resizerStyle, className: className +
                    (resizing ? ' resizing' : '') +
                    (resizerClassName ? ` ${resizerClassName}` : ``), index: index - 1, onDragStarted: handleDragStart }));
        }
        entries.push(React.createElement(Pane_1.Pane, { key: 'pane.' + key, forwardRef: ref, size: size, minSize: minSize, split: split, className: className }, node));
    });
    return (React.createElement("div", { className: classes, style: style },
        React.createElement("div", { className: dragLayerClasses, style: dragLayerStyle }),
        entries));
});
exports.SplitPane.displayName = 'SplitPane';
//# sourceMappingURL=SplitPane.js.map