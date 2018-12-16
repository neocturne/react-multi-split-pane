import * as React from 'react';

export interface ResizerProps {
	split: 'horizontal' | 'vertical';
	className: string;

	onMouseDown: (event: React.MouseEvent) => void;
	onTouchStart: (event: React.TouchEvent) => void;
}

export class Resizer extends React.Component<ResizerProps> {
	public render() {
		const {
			className,
			split,
			onMouseDown,
			onTouchStart,
		} = this.props;

		const classes = ['Resizer', split, className].join(' ');

		return (
			<span
				role='presentation'
				className={classes}
				style={{flex: 'none'}}
				onMouseDown={onMouseDown}
				onTouchStart={onTouchStart}
			/>
		);
	}
}
