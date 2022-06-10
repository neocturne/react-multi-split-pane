import * as React from 'react';
export interface SplitPaneProps {
    split?: 'horizontal' | 'vertical';
    className?: string;
    resizerClassName?: string;
    resizerStyle?: {
        [key: string]: string;
    };
    children: React.ReactChild[];
    defaultSizes?: number[];
    minSize?: number | number[];
    onDragStarted?: () => void;
    onChange?: (sizes: number[]) => void;
    onDragFinished?: (sizes: number[]) => void;
}
export interface SplitPaneResizeOptions extends SplitPaneProps {
    split: 'horizontal' | 'vertical';
    className: string;
}
export declare const SplitPane: React.MemoExoticComponent<(props: SplitPaneProps) => JSX.Element>;
