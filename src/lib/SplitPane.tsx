import * as React from 'react';

import { Pane } from './Pane';
import { Resizer } from './Resizer';
import { ClientPosition } from './util';

const DEFAULT_MIN_SIZE = 50;

export interface SplitPaneProps {
	split: 'horizontal' | 'vertical';
	className: string;

	children: React.ReactNode;

	defaultSizes?: number[];
	minSize?: number | number[];

	onDragStarted?: () => void;
	onChange?: (sizes: number[]) => void;
	onDragFinished?: (sizes: number[]) => void;
}

interface ResizeAction {
	sizes: number[];
	origin: number;
	index: number;
}

interface SplitPaneState {
	sizes: Map<string, number>;
	resize: ResizeAction | null;
}

export class SplitPane extends React.PureComponent<SplitPaneProps, SplitPaneState> {
	public static readonly defaultProps = {
		split: 'vertical',
		className: '',
	};

	private readonly paneRefs = new Map<string, HTMLDivElement>();

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
		if (this.props.children !== prevProps.children) {
			this.setState({
				resize: null,
			});
		}
	}

	public render() {
		const {
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

		this.getChildPanes().forEach(([key, pane], index) => {
			const sizeState = resize ? resize.sizes[index] : sizes.get(key);

			const size = (sizeState !== undefined) ? sizeState : this.getDefaultSize(index);
			const minSize = this.getMinSize(index);

			if (index !== 0) {
				const resizing = resize && resize.index === (index - 1);

				entries.push((
					<Resizer
						key={'resizer.' + index}
						split={split}
						className={className + (resizing ? ' resizing' : '')}
						index={index - 1}
						onDragStarted={this.handleDragStart}
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
					{ pane }
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

	private getDefaultSize(index: number): number {
		const { defaultSizes } = this.props;

		if (defaultSizes) {
			const value = defaultSizes[index];
			if (value >= 0) {
				return value;
			}
		}

		return 1;
	}

	private getMinSize(index: number): number {
		const { minSize } = this.props;

		if (typeof minSize === 'number') {
			if (minSize > 0) {
				return minSize;
			}
		} else if (minSize) {
			const value = minSize[index];
			if (value > 0) {
				return value;
			}
		}

		return DEFAULT_MIN_SIZE;
	}

	private getNodeKey(node: any, index: number): string {
		if (
			typeof node === 'object' &&
			node !== null &&
			node.key !== undefined
		) {
			return 'key.' + node.key;
		}

		return 'index.' + index;
	}

	private getChildPanes(): Array<[string, React.ReactNode]> {
		return (React.Children.toArray(this.props.children)
			.map((node, index): [string, React.ReactNode] =>
				[this.getNodeKey(node, index), node],
			)
		);
	}

	private paneRef = (key: string) => (ref: HTMLDivElement | null) => {
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

	private getSizeUpdate(): Map<string, number> {
		const sizeAttr = this.getSizeAttr();
		const childPanes = this.getChildPanes();

		return new Map(childPanes.map(([key]): [string, number] => {
			const node = this.paneRefs.get(key);

			const size = node ? node.getBoundingClientRect()[sizeAttr] : 0;
			return [key, size];
		}));
	}

	private collectSizes(sizes: Map<React.Key, number>): number[] {
		const childPanes = this.getChildPanes();
		return childPanes.map(([key]) => (
			sizes.get(key) || 0
		));
	}

	private handleDragStart = (index: number, pos: ClientPosition) => {
		const { onDragStarted, split } = this.props;
		const origin =
			split === 'vertical'
				? pos.clientX
				: pos.clientY;
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
		const childPanes = this.getChildPanes();

		const first = childPanes[index];
		const second = childPanes[index + 1];
		if (!offset || !first || !second) {
			return 0;
		}

		const firstMinSize = this.getMinSize(index);
		const secondMinSize = this.getMinSize(index + 1);

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

	private onMouseMove = (event: ClientPosition) => {
		const { resize, sizes } = this.state;
		if (!resize) {
			return;
		}

		const { split, onChange } = this.props;
		const { origin, index } = resize;

		const current =
			split === 'vertical'
				? event.clientX
				: event.clientY;

		const newSizes = this.collectSizes(sizes);

		if (this.move(newSizes, index, current - origin) !== 0) {
			if (onChange) {
				onChange(newSizes);
			}
		}

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

		const { sizes } = resize;
		const { onDragFinished } = this.props;
		if (onDragFinished) {
			onDragFinished(sizes);
		}

		const sizeMap = new Map(this.getChildPanes().map(
			([key], index): [string, number] => (
				[key, sizes[index]]
			),
		));

		this.setState({ resize: null, sizes: sizeMap });
	}
}
