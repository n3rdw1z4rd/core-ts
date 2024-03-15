import '../src/css/reset.css';
import '../src/css/my-styles.css';
import { CanvasRenderer, Clock, Color, ECS, Entity, Logger, rng } from '../src';

function makeRandomMatrix(m: number): number[][] {
    const rows: number[][] = [];

    for (let i = 0; i < m; i++) {
        const row: number[] = [];

        for (let j = 0; j < m; j++) {
            row.push(rng.nextf * 2 - 1);
        }

        rows.push(row);
    }

    return rows;
}

const log: Logger = new Logger();
log.info('*** Particles ***');

const clock: Clock = new Clock();
const renderer: CanvasRenderer = new CanvasRenderer();
renderer.appendTo(document.body);

const ecs: ECS = new ECS();

const particleCount: number = 1000;
const beta: number = 0.3;
const dt: number = 0.02;
const frictionHalfLife: number = 0.04;
const rMax: number = 0.1;
const m = 6;
const matrix: number[][] = makeRandomMatrix(m);
const forceFactor: number = 10;
const frictionFactor: number = Math.pow(0.5, dt / frictionHalfLife);

ecs.createComponent('particle', {
    px: () => rng.nextf,
    py: () => rng.nextf,
    vx: 0,
    vy: 0,
    color: () => ((rng.nextf * m) | 0),
});

ecs.createSystem('velocities', 'particle', (entities: Entity[]) => {
    const count: number = entities.length;

    for (let i = 0; i < count; i++) {
        let totalForceX: number = 0;
        let totalForceY: number = 0;

        const particle1 = entities[i].components.get('particle');

        for (let j = 0; j < count; j++) {
            if (j === i) continue;

            const particle2 = entities[j].components.get('particle');

            let rx: number = particle2.px - particle1.px;
            let ry: number = particle2.py - particle1.py;

            if (Math.abs(rx) > 0.5) rx = rx > 0 ? rx - 1 : rx + 1;
            if (Math.abs(ry) > 0.5) ry = ry > 0 ? ry - 1 : ry + 1;

            const r: number = Math.hypot(rx, ry);

            if (r > 0 && r < rMax) {
                const force: number = (r < beta)
                    ? r / beta - 1
                    : (beta < r && r < 1)
                        ? matrix[particle1.color][particle2.color] * (1 - Math.abs(2 * r - 1 - beta) / (1 - beta))
                        : 0;

                totalForceX += rx / r * force;
                totalForceY += ry / r * force;
            }
        }

        totalForceX *= rMax * forceFactor;
        totalForceY *= rMax * forceFactor;

        particle1.vx *= frictionFactor;
        particle1.vy *= frictionFactor;

        particle1.vx += totalForceX * dt;
        particle1.vy += totalForceY * dt;
    }
});

ecs.createSystem('positions', 'particle', (entities: Entity[]) => {
    for (let i = 0; i < entities.length; i++) {
        const p = entities[i].components.get('particle');

        p.px += p.vx * dt;
        p.py += p.vy * dt;

        if (p.px < 0) p.px = 1 + (p.px % 1);
        if (p.px > 1) p.px = p.px % 1;
        if (p.py < 0) p.py = 1 + (p.py % 1);
        if (p.py > 1) p.py = p.py % 1;

        const screenX: number = p.px * renderer.width;
        const screenY: number = p.py * renderer.height;
        const color: Color = Color.HSV(360 * (p.color / m), 1.0, 0.5);

        renderer.setPixel(screenX, screenY, color);
    }
});

for (let i = 0; i < particleCount; i++) {
    ecs.createEntity('particle');
}

clock.run((t: number) => {
    ecs.update();
    renderer.render();
});