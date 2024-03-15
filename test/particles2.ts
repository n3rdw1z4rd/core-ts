import '../src/css/reset.css';
import '../src/css/my-styles.css';
import { CanvasRenderer, Clock } from '../src';

function makeRandomMatrix(m: number): number[][] {
    const rows: number[][] = [];

    for (let i = 0; i < m; i++) {
        const row: number[] = [];

        for (let j = 0; j < m; j++) {
            row.push(Math.random() * 2 - 1);
        }

        rows.push(row);
    }

    return rows;
}

function force(r: number, a: number): number {
    const beta: number = 0.3;

    if (r < beta) {
        return r / beta - 1;
    } else if (beta < r && r < 1) {
        return a * (1 - Math.abs(2 * r - 1 - beta) / (1 - beta));
    } else {
        return 0;
    }
}

const clock: Clock = new Clock();
const renderer: CanvasRenderer = new CanvasRenderer();
renderer.appendTo(document.body);

const n: number = 1000;
const dt: number = 0.02;
const frictionHalfLife: number = 0.040;
const rMax: number = 0.1;
const m = 6;
const matrix: number[][] = makeRandomMatrix(m);
const forceFactor: number = 10;

const frictionFactor: number = Math.pow(0.5, dt / frictionHalfLife);

const colors: Int32Array = new Int32Array(n);
const positionsX: Float32Array = new Float32Array(n);
const positionsY: Float32Array = new Float32Array(n);
const velocitiesX: Float32Array = new Float32Array(n);
const velocitiesY: Float32Array = new Float32Array(n);

for (let i = 0; i < n; i++) {
    colors[i] = Math.floor(Math.random() * m);
    positionsX[i] = Math.random();
    positionsY[i] = Math.random();
    velocitiesX[i] = 0;
    velocitiesY[i] = 0;
}

clock.run((t: number) => {
    for (let i = 0; i < n; i++) {
        let totalForceX: number = 0;
        let totalForceY: number = 0;

        for (let j = 0; j < n; j++) {
            if (j === i) continue;

            let rx: number = positionsX[j] - positionsX[i];
            let ry: number = positionsY[j] - positionsY[i];

            if (Math.abs(rx) > 0.5) rx = rx > 0 ? rx - 1 : rx + 1;
            if (Math.abs(ry) > 0.5) ry = ry > 0 ? ry - 1 : ry + 1;

            const r: number = Math.hypot(rx, ry);

            if (r > 0 && r < rMax) {
                const f: number = force(r / rMax, matrix[colors[i]][colors[j]]);
                totalForceX += rx / r * f;
                totalForceY += ry / r * f;
            }
        }

        totalForceX *= rMax * forceFactor;
        totalForceY *= rMax * forceFactor;

        velocitiesX[i] *= frictionFactor;
        velocitiesY[i] *= frictionFactor;

        velocitiesX[i] += totalForceX * dt;
        velocitiesY[i] += totalForceY * dt;
    }

    for (let i = 0; i < n; i++) {
        positionsX[i] += velocitiesX[i] * dt;
        positionsY[i] += velocitiesY[i] * dt;

        if (positionsX[i] < 0) positionsX[i] = 1 + (positionsX[i] % 1);
        if (positionsX[i] > 1) positionsX[i] = positionsX[i] % 1;
        if (positionsY[i] < 0) positionsY[i] = 1 + (positionsY[i] % 1);
        if (positionsY[i] > 1) positionsY[i] = positionsY[i] % 1;

        renderer.bufferContext.beginPath();

        const screenX: number = positionsX[i] * renderer.width;
        const screenY: number = positionsY[i] * renderer.height;

        renderer.bufferContext.arc(screenX, screenY, 1, 0, 2 * Math.PI);
        renderer.bufferContext.fillStyle = `hsl(${360 * (colors[i] / m)}, 100%, 50%)`;
        renderer.bufferContext.fill();
    }

    renderer.render();
});