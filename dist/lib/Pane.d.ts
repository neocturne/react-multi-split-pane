import * as React from 'react';
export interface PaneProps {
    size: number;
    minSize: number;
    split: 'horizontal' | 'vertical';
    className: string;
    forwardRef: React.Ref<HTMLDivElement>;
    children: React.ReactNode;
}
export declare const Pane: React.MemoExoticComponent<({ size, minSize, split, className, forwardRef, children }: PaneProps) => JSX.Element>;
