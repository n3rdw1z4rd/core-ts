import '../src/css/reset.css';
import '../src/css/my-styles.css';
import { CanvasRenderer, Clock, Color, ECS, Logger, StatsDiv, rng } from '../src';

const log: Logger = new Logger();
log.info('*** particle-life: https://www.youtube.com/watch?v=scvuli-zcRc ***');

const clock: Clock = new Clock();

const renderer: CanvasRenderer = new CanvasRenderer();
renderer.appendTo(document.body);

const statsDiv: StatsDiv = new StatsDiv();
statsDiv.appendTo(document.body);

const ecs: ECS = new ECS();

const calcForce = (r: number, a: number, beta: number = 0.3): number => (r < beta)
    ? r / beta - 1
    : (beta < r && r < 1)
        ? a * (1 - Math.abs(2 * r - 1 - beta) / (1 - beta))
        : 0;

const calcSpeed = (speedFactor: number = 1.0): number => clock.deltaTimeSeconds * speedFactor;

const frictionHalfLife: number = 0.04;

const particleColors: Color[] = [
    Color.RED,
    Color.GREEN,
    Color.BLUE,
    Color.MAGENTA,
    Color.ORANGE,
    Color.PURPLE,
    Color.CYAN,
    Color.WHITE,
    Color.YELLOW,
];

const particleCount: number = 1000;
const particleTypeCount: number = particleColors.length;
const particleSize: number = 3.0;

const attractionMatrix: number[][] = rng.randomMatrix(particleTypeCount);
const maxRadiusFactor: number = 0.1;
const forceFactor: number = 10.0;

ecs.createComponent('particle', {
    px: () => rng.nextf,
    py: () => rng.nextf,
    vx: 0,
    vy: 0,
    color: () => rng.range(particleTypeCount - 1),
});

ecs.createSystem('update_velocities', 'particle', (entities: any[]) => {
    const frictionFactor: number = Math.pow(0.5, calcSpeed() / frictionHalfLife);

    for (let i = 0; i < entities.length; i++) {
        let totalForceX: number = 0;
        let totalForceY: number = 0;

        for (let j = 0; j < entities.length; j++) {
            if (j === i) continue;

            let rx: number = entities[j].particle.px - entities[i].particle.px;
            let ry: number = entities[j].particle.py - entities[i].particle.py;

            if (Math.abs(rx) > 0.5) rx = rx > 0 ? rx - 1 : rx + 1;
            if (Math.abs(ry) > 0.5) ry = ry > 0 ? ry - 1 : ry + 1;

            const r: number = Math.hypot(rx, ry);

            if (r > 0 && r < maxRadiusFactor) {
                const f: number = calcForce(
                    r / maxRadiusFactor,
                    attractionMatrix[entities[i].particle.color][entities[j].particle.color]);

                totalForceX += rx / r * f;
                totalForceY += ry / r * f;
            }
        }

        totalForceX *= maxRadiusFactor * forceFactor;
        totalForceY *= maxRadiusFactor * forceFactor;

        entities[i].particle.vx *= frictionFactor;
        entities[i].particle.vy *= frictionFactor;

        entities[i].particle.vx += totalForceX * calcSpeed();
        entities[i].particle.vy += totalForceY * calcSpeed();
    }
});

ecs.createSystem('update_positions', 'particle', (entities: any[]) => {
    for (let i = 0; i < particleCount; i++) {
        entities[i].particle.px += entities[i].particle.vx * calcSpeed();
        entities[i].particle.py += entities[i].particle.vy * calcSpeed();

        if (entities[i].particle.px < 0) entities[i].particle.px = 1 + (entities[i].particle.px % 1);
        if (entities[i].particle.px > 1) entities[i].particle.px = entities[i].particle.px % 1;
        if (entities[i].particle.py < 0) entities[i].particle.py = 1 + (entities[i].particle.py % 1);
        if (entities[i].particle.py > 1) entities[i].particle.py = entities[i].particle.py % 1;

        renderer.setPixel(
            entities[i].particle.px * renderer.width,
            entities[i].particle.py * renderer.height,
            particleColors[entities[i].particle.color],
            particleSize,
        );
    }
});

for (let i = 0; i < particleCount; i++) ecs.createEntity('particle');

clock.run(() => {
    const ecsUpdateTime: number = clock.getExecuteTime(ecs.update.bind(ecs));
    const renderTime: number = clock.getExecuteTime(renderer.render.bind(renderer));

    clock.showStats({
        'particleCount': particleCount,
        'particleTypeCount': particleTypeCount,
        'ecs.update(ms)': ecsUpdateTime.toFixed(2),
        'renderer.render(ms)': renderTime.toFixed(2),
    });
});