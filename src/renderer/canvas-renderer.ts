import { Color } from './color';
import { Logger } from '../logger';

const log: Logger = new Logger('[CanvasRenderer]');

export class CanvasRenderer {
    private _screenCanvas: HTMLCanvasElement;
    private _bufferCanvas: OffscreenCanvas;

    public screenContext: CanvasRenderingContext2D;
    public bufferContext: OffscreenCanvasRenderingContext2D;

    get width(): number { return this._screenCanvas.width; }
    get height(): number { return this._screenCanvas.height; }

    pixelRatio: number = window.devicePixelRatio;

    constructor(canvas?: HTMLCanvasElement) {
        this._screenCanvas = canvas ?? document.createElement('canvas');
        this._bufferCanvas = new OffscreenCanvas(this._screenCanvas.width, this._screenCanvas.height);

        this.screenContext = this._screenCanvas.getContext('2d')!;
        this.bufferContext = this._bufferCanvas.getContext('2d')!;

        if (!this.screenContext || !this.bufferContext) {
            throw 'Failed to create CanvasRenderingContext2D';
        }
    }

    appendTo(target: HTMLElement | null, autoResize: boolean = true): void {
        if (this._screenCanvas.parentNode) {
            this._screenCanvas.parentNode.removeChild(this._screenCanvas);
        }

        if (target) {
            target.appendChild(this._screenCanvas);

            if (autoResize) {
                this.resize();
            }
        }
    }

    resize(displayWidth?: number, displayHeight?: number): boolean {
        const { width, height } = (
            this._screenCanvas.parentElement?.getBoundingClientRect() ??
            this._screenCanvas.getBoundingClientRect()
        );

        displayWidth = (0 | (displayWidth ?? width) * this.pixelRatio);
        displayHeight = (0 | (displayHeight ?? height) * this.pixelRatio);

        if (this._screenCanvas.width !== displayWidth || this._screenCanvas.height !== displayHeight) {
            this._screenCanvas.width = displayWidth
            this._screenCanvas.height = displayHeight;

            this._bufferCanvas.width = displayWidth;
            this._bufferCanvas.height = displayHeight;

            return true;
        }

        return false;
    }

    setPixel(x: number, y: number, color: Color, size: number = 2): void {
        let c = color.hexStr;
        // log.debug('setPixel', { x, y, c, size });
        this.bufferContext.fillStyle = c;
        this.bufferContext.fillRect(x - (size / 2), y - (size / 2), size, size);
    }

    render(): void {
        this.screenContext.clearRect(0, 0, this._screenCanvas.width, this._screenCanvas.height);
        this.screenContext.drawImage(this._bufferCanvas, 0, 0);
        this.bufferContext.clearRect(0, 0, this._screenCanvas.width, this._screenCanvas.height);
    }
}