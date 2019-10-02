import * as React from 'react';

import { ClientPosition } from './util';

export interface ResizerProps {
	split: 'horizontal' | 'vertical';
	className: string;
	index: number;

	onDragStarted: (index: number, pos: ClientPosition) => void;
}

export class Resizer extends React.PureComponent<ResizerProps> {
	public render() {
		const {
			split,
			className,
		} = this.props;

		const classes = ['Resizer', split, className].join(' ');

		return (
			<span
				role='presentation'
				className={classes}
				style={{flex: 'none'}}
				onMouseDown={this.handleMouseDown}
				onTouchStart={this.handleTouchStart}
			/>
		);
	}

	private handleMouseDown = (event: React.MouseEvent) => {
		event.preventDefault();

		const { index, onDragStarted } = this.props;
		onDragStarted(index, event);
	}

	private handleTouchStart = (event: React.TouchEvent) => {
		event.preventDefault();

		const { index, onDragStarted } = this.props;
		onDragStarted(index, event.touches[0]);
	}
}
