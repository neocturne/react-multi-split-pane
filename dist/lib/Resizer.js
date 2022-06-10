"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resizer = void 0;
const React = require("react");
const { useCallback } = React;
exports.Resizer = React.memo(({ split, className, index, style = {}, onDragStarted }) => {
    const handleMouseDown = useCallback((event) => {
        event.preventDefault();
        onDragStarted(index, event);
    }, [index, onDragStarted]);
    const handleTouchStart = useCallback((event) => {
        event.preventDefault();
        onDragStarted(index, event.touches[0]);
    }, [index, onDragStarted]);
    const classes = ['Resizer', split, className].join(' ');
    return (React.createElement("span", { role: 'presentation', className: classes, style: Object.assign({ flex: 'none' }, style), onMouseDown: handleMouseDown, onTouchStart: handleTouchStart }));
});
exports.Resizer.displayName = 'Resizer';
//# sourceMappingURL=Resizer.js.map