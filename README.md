# React Multi Split Pane

[![NPM version](https://img.shields.io/npm/v/react-multi-split-pane.svg?style=flat)](https://www.npmjs.com/package/react-multi-split-pane)
![NPM license](https://img.shields.io/npm/l/react-multi-split-pane.svg?style=flat)

Fork of [react-split-pane](https://github.com/tomkp/react-split-pane) with support for more than two panes.

## Installing
```sh
npm install react-multi-split-pane

# or if you use yarn

yarn add react-multi-split-pane
```

## Example Usage
```jsx
<SplitPane split="vertical" minSize={50}>
    <div></div>
    <div></div>
    <div></div>
</SplitPane>
```

```jsx
<SplitPane split="vertical" minSize={50}>
    <div></div>
    <SplitPane split="horizontal">
        <div></div>
        <div></div>
    </SplitPane>
</SplitPane>
```

## Notes for updating from react-multi-split-pane v0.1.x

All code has been cleaned up significantly by moving to React Hooks. Due to
the restructuring, the `onChange` callback is not supported anymore.

## Differences from [react-split-pane](https://github.com/tomkp/react-split-pane)

Much of the code has been rewritten, so the feature set is a bit different. All
code has been converted to TypeScript.

The most important changes:

* All pane sizes are relative, so when the window is resized, all panes
  grow/shrink at the same time (as far as their `minSize` properties allow)
* An array of all pane sizes is passed to the `onDragFinished` and `onChange`
  callbacks

## Props
### split: 'vertical' | 'horizontal'
Split direction, defaults to vertical.

### defaultSizes: number[]
Array of (relative) default sizes for the individual panes. Missing values
default to 1. When no `defaultSizes` are passed, all sizes default to 1,
equally distributing the available space (as far as `minSize` values permit).

### minSize: number | number[]
Minimum size of all panes (in pixels), or array containing individual minimum
sizes for each pane. Defaults to 50.

### className: string
Additional CSS class name that is appied to all elements rendered by the
SplitPane. For a class name `custom`, the individual elements can be selected as
`.SplitPane.custom`, `.Resizer.custom`, and `.Pane.custom`.

### onDragStarted: () => void
This callback is invoked when a drag starts.

### onDragFinished: (sizes: number[]) => void
This callback is invoked when a drag ends.

## Persisting Positions

Each SplitPane accepts an onChange function prop.  Used in conjunction with
defaultSize and a persistence layer, you can ensure that your splitter choices
survive a refresh of your app.

For example, if you are comfortable with the trade-offs of localStorage, you
could do something like the following:

```jsx
<SplitPane
    split="vertical" minSize={50}
    defaultSizes={JSON.parse(localStorage.getItem('splitPos')) || undefined}
    onDragFinished={(size) => localStorage.setItem('splitPos', JSON.stringify(size))}
>
    <div></div>
    <div></div>
</SplitPane>
```

## Example styling

This gives a single pixel wide divider, but with a 'grabbable' surface of 11
pixels.

Thanks to `background-clip: padding-box;` for making transparent borders
possible.


```css
.Resizer {
    background: #000;
    opacity: .2;
    z-index: 1;
    box-sizing: border-box;
    background-clip: padding-box;
}

.Resizer:hover {
    transition: all 2s ease;
}

.Resizer.horizontal {
    height: 11px;
    margin: -5px 0;
    border-top: 5px solid rgba(255, 255, 255, 0);
    border-bottom: 5px solid rgba(255, 255, 255, 0);
    cursor: row-resize;
}

.Resizer.horizontal:hover, .Resizer.horizontal.resizing {
    border-top: 5px solid rgba(0, 0, 0, 0.5);
    border-bottom: 5px solid rgba(0, 0, 0, 0.5);
}

.Resizer.vertical {
    width: 11px;
    margin: 0 -5px;
    border-left: 5px solid rgba(255, 255, 255, 0);
    border-right: 5px solid rgba(255, 255, 255, 0);
    cursor: col-resize;
}

.Resizer.vertical:hover, .Resizer.vertical.resizing {
    border-left: 5px solid rgba(0, 0, 0, 0.5);
    border-right: 5px solid rgba(0, 0, 0, 0.5);
}

.DragLayer {
	z-index: 1;
	pointer-events: none;
}

.DragLayer.resizing {
	pointer-events: auto;
}

.DragLayer.horizontal {
	cursor: row-resize;
}

.DragLayer.vertical {
	cursor: col-resize;
}
```
