import * as React from 'react';

import { Pane } from './Pane';
import { Resizer } from './Resizer';

const DEFAULT_MIN_SIZE = 100;

export interface ChildPane {
	child: React.ReactNode;
	key: React.Key;

	defaultSize: number;
	minSize?: number;
}

export interface SplitPaneProps {
	split: 'horizontal' | 'vertical';
	className: string;

	childPanes: ReadonlyArray<ChildPane>;

	onDragStarted?: () => void;
	onDragFinished?: () => void;
}

interface ResizeAction {
	sizes: number[];
	origin: number;
	index: number;
}

interface SplitPaneState {
	sizes: Map<React.Key, number>;
	resize: ResizeAction | null;
}

interface Touch {
	clientX: number;
	clientY: number;
}

export class SplitPane extends React.Component<SplitPaneProps, SplitPaneState> {
	public static readonly defaultProps = {
		className: '',
	};

	private static getMinSize({ minSize }: ChildPane): number {
		if (!minSize || minSize <= 0) {
			return DEFAULT_MIN_SIZE;
		}

		return minSize;
	}

	private readonly paneRefs = new Map<React.Key, HTMLDivElement>();

	constructor(props: SplitPaneProps) {
		super(props);

		this.state = {
			sizes: new Map(),
			resize: null,
		};
	}

	public componentDidMount() {
		document.addEventListener('mouseup', this.onMouseUp);
		document.addEventListener('mousemove', this.onMouseMove);
		document.addEventListener('touchmove', this.onTouchMove);
	}

	public componentWillUnmount() {
		document.removeEventListener('mouseup', this.onMouseUp);
		document.removeEventListener('mousemove', this.onMouseMove);
		document.removeEventListener('touchmove', this.onTouchMove);
	}

	public componentDidUpdate(prevProps: SplitPaneProps) {
		if (this.props.childPanes !== prevProps.childPanes) {
			this.setState({
				resize: null,
			});
		}
	}

	public render() {
		const {
			childPanes,
			split,
			className,
		} = this.props;
		const {
			resize,
			sizes,
		} = this.state;

		let splitStyleProps: React.CSSProperties;

		if (split === 'vertical') {
			splitStyleProps = {
				left: 0,
				right: 0,
				flexDirection: 'row',
			};
		} else {
			splitStyleProps = {
				bottom: 0,
				top: 0,
				flexDirection: 'column',
				minHeight: '100%',
				width: '100%',
			};
		}

		const style: React.CSSProperties = {
			display: 'flex',
			flex: 1,
			height: '100%',
			position: 'absolute',
			outline: 'none',
			overflow: 'hidden',
			...splitStyleProps,
		};
		const classes = ['SplitPane', split, className].join(' ');

		const dragLayerStyle: React.CSSProperties = {
			position: 'absolute',
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
		};
		const dragLayerClasses = ['DragLayer', split, resize ? 'resizing' : '', className].join(' ');

		const entries: React.ReactNode[] = [];

		childPanes.forEach((pane, index) => {
			const {
				key,
				defaultSize,
				child,
			} = pane;
			const sizeState = resize ? resize.sizes[index] : sizes.get(key);

			const size = (sizeState !== undefined) ? sizeState : defaultSize;
			const minSize = SplitPane.getMinSize(pane);

			if (index !== 0) {
				entries.push((
					<Resizer
						key={'resizer.' + index}
						split={split}
						className={className}
						onMouseDown={this.onMouseDown(index - 1)}
						onTouchStart={this.onTouchStart(index - 1)}
					/>
				));
			}

			entries.push((
				<Pane
					key={'pane.' + key}
					forwardRef={this.paneRef(key)}
					size={size}
					minSize={minSize}
					split={split}
					className={className}
				>
					{ child }
				</Pane>
			));
		});

		return (
			<div
				className={classes}
				style={style}
			>
				<div
					className={dragLayerClasses}
					style={dragLayerStyle}
				/>
				{ entries }
			</div>
		);
	}

	private paneRef = (key: React.Key) => (ref: HTMLDivElement | null) => {
		if (ref) {
			this.paneRefs.set(key, ref);
		} else {
			this.paneRefs.delete(key);
		}
	}

	private getSizeAttr(): 'width' | 'height' {
		switch (this.props.split) {
		case 'horizontal':
			return 'height';

		case 'vertical':
			return 'width';
		}
	}

	private getSizeUpdate(): Map<React.Key, number> {
		const sizeAttr = this.getSizeAttr();

		const ret = new Map<React.Key, number>();

		for (const { key } of this.props.childPanes) {
			const pane = this.paneRefs.get(key);
			if (!pane) {
				continue;
			}

			const size = pane.getBoundingClientRect()[sizeAttr];
			ret.set(key, size);
		}

		return ret;
	}

	private collectSizes(sizes: Map<React.Key, number>): number[] {
		const { childPanes } = this.props;
		return childPanes.map(({ key }) => sizes.get(key) || 0);
	}

	private onTouchStart = (index: number) => (event: React.TouchEvent) => {
		event.preventDefault();
		this.dragStart(index, event.touches[0]);
	}

	private onMouseDown = (index: number) => (event: React.MouseEvent) => {
		event.preventDefault();
		this.dragStart(index, event);
	}

	private dragStart(index: number, event: Touch) {
		const { onDragStarted, split, childPanes } = this.props;
		const origin =
			split === 'vertical'
				? event.clientX
				: event.clientY;
		const sizes = this.getSizeUpdate();

		if (onDragStarted) {
			onDragStarted();
		}

		this.setState({
			resize: {
				origin,
				index,
				sizes: this.collectSizes(sizes),
			},
			sizes,
		});
	}

	private move(sizes: number[], index: number, offset: number): number {
		const { childPanes } = this.props;

		const first = childPanes[index];
		const second = childPanes[index + 1];
		if (!first || !second) {
			return 0;
		}

		const firstMinSize = SplitPane.getMinSize(first);
		const secondMinSize = SplitPane.getMinSize(second);

		const firstSize = sizes[index] + offset;
		const secondSize = sizes[index + 1] - offset;

		if (offset < 0 && firstSize < firstMinSize) {
			// offset is negative, so missing and pushed are, too
			const missing = firstSize - firstMinSize;
			const pushed = this.move(sizes, index - 1, missing);

			offset -= (missing - pushed);
		} else if (offset > 0 && secondSize < secondMinSize) {
			const missing = secondMinSize - secondSize;
			const pushed = this.move(sizes, index + 1, missing);

			offset -= (missing - pushed);
		}

		sizes[index] += offset;
		sizes[index + 1] -= offset;

		return offset;
	}

	private onTouchMove = (event: TouchEvent) => {
		this.onMouseMove(event.touches[0]);
	}

	private onMouseMove = (event: Touch) => {
		const { resize, sizes } = this.state;
		if (!resize) {
			return;
		}

		const { split } = this.props;
		const { origin, index } = resize;

		const current =
			split === 'vertical'
				? event.clientX
				: event.clientY;

		const newSizes = this.collectSizes(sizes);

		this.move(newSizes, index, current - origin);

		this.setState({
			resize: {
				...resize,
				sizes: newSizes,
			},
		});
	}

	private onMouseUp = () => {
		const { resize } = this.state;
		if (!resize) {
			return;
		}

		const { childPanes, onDragFinished } = this.props;
		if (onDragFinished) {
			onDragFinished();
		}

		const { sizes } = resize;
		const sizeMap = new Map(childPanes.map(
			({ key }, index): [React.Key, number] => (
				[key, sizes[index]]
			),
		));

		this.setState({ resize: null, sizes: sizeMap });
	}
}
