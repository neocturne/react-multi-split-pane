"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pane = void 0;
const React = require("react");
const baseStyle = {
    position: 'relative',
    outline: 'none',
    border: 0,
    overflow: 'hidden',
    display: 'flex',
    flexBasis: 'auto',
};
exports.Pane = React.memo(({ size, minSize, split, className, forwardRef, children }) => {
    const style = Object.assign(Object.assign({}, baseStyle), { flexGrow: size, flexShrink: size });
    if (split === 'vertical') {
        style.width = 0;
        style.height = '100%';
        style.minWidth = minSize;
    }
    else {
        style.width = '100%';
        style.height = 0;
        style.minHeight = minSize;
    }
    const classes = ['Pane', split, className].join(' ');
    return (React.createElement("div", { className: classes, style: style, ref: forwardRef }, children));
});
exports.Pane.displayName = 'Pane';
//# sourceMappingURL=Pane.js.map