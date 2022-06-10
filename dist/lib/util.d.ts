export interface ClientPosition {
    clientX: number;
    clientY: number;
}
export declare function useEventListener<K extends keyof DocumentEventMap>(type: K, listener?: (this: Document, ev: DocumentEventMap[K]) => void): void;
export interface DragState<T> {
    offset: number;
    extraState: T;
}
export declare function useDragState<T>(split: 'horizontal' | 'vertical', onDragFinished: (dragState: DragState<T>) => void): [DragState<T> | null, (pos: ClientPosition, extraState: T) => void];
