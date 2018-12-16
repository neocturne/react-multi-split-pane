import * as React from 'react';

export interface PaneProps {
	size: number;
	minSize: number;

	split: 'horizontal' | 'vertical';
	className: string;

	forwardRef: React.Ref<HTMLDivElement>;
}

const baseStyle: React.CSSProperties = {
	position: 'relative',
	outline: 'none',
	border: 0,
	overflow: 'hidden',
	display: 'flex',
	flexBasis: 'auto',
};

export class Pane extends React.PureComponent<PaneProps> {
	public render() {
		const {
			size,
			minSize,
			children,
			split,
			className,
			forwardRef,
		} = this.props;

		const style: React.CSSProperties = {
			...baseStyle,
			flexGrow: size,
			flexShrink: size,
		};

		if (split === 'vertical') {
			style.width = 0;
			style.height = '100%';
			style.minWidth = minSize;
		} else {
			style.width = '100%';
			style.height = 0;
			style.minHeight = minSize;
		}

		const classes = ['Pane', split, className].join(' ');

		return (
			<div className={classes} style={style} ref={forwardRef}>
				{children}
			</div>
		);
	}
}
