import '../src/css/reset.css';
import '../src/css/my-styles.css';
import { CanvasRenderer, Clock, Color, ECS, Entity, Logger, StatsDiv, rng } from '../src';

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
    color: () => ((rng.nextf * particleTypeCount) | 0),
});

ecs.createSystem('update_velocities', 'particle', (entities: Entity[]) => {
    const frictionFactor: number = Math.pow(0.5, calcSpeed() / frictionHalfLife);

    for (let i = 0; i < particleCount; i++) {
        let totalForceX: number = 0;
        let totalForceY: number = 0;

        for (let j = 0; j < particleCount; j++) {
            if (j === i) continue;

            let rx: number = entities[j].components.particle.px - entities[i].components.particle.px;
            let ry: number = entities[j].components.particle.py - entities[i].components.particle.py;

            if (Math.abs(rx) > 0.5) rx = rx > 0 ? rx - 1 : rx + 1;
            if (Math.abs(ry) > 0.5) ry = ry > 0 ? ry - 1 : ry + 1;

            const r: number = Math.hypot(rx, ry);

            if (r > 0 && r < maxRadiusFactor) {
                const f: number = calcForce(
                    r / maxRadiusFactor,
                    attractionMatrix[entities[i].components.particle.color][entities[j].components.particle.color]);
                totalForceX += rx / r * f;
                totalForceY += ry / r * f;
            }
        }

        totalForceX *= maxRadiusFactor * forceFactor;
        totalForceY *= maxRadiusFactor * forceFactor;

        entities[i].components.particle.vx *= frictionFactor;
        entities[i].components.particle.vy *= frictionFactor;

        entities[i].components.particle.vx += totalForceX * calcSpeed();
        entities[i].components.particle.vy += totalForceY * calcSpeed();
    }
});

ecs.createSystem('update_positions', 'particle', (entities: Entity[]) => {
    for (let i = 0; i < particleCount; i++) {
        entities[i].components.particle.px += entities[i].components.particle.vx * calcSpeed();
        entities[i].components.particle.py += entities[i].components.particle.vy * calcSpeed();

        if (entities[i].components.particle.px < 0) entities[i].components.particle.px = 1 + (entities[i].components.particle.px % 1);
        if (entities[i].components.particle.px > 1) entities[i].components.particle.px = entities[i].components.particle.px % 1;
        if (entities[i].components.particle.py < 0) entities[i].components.particle.py = 1 + (entities[i].components.particle.py % 1);
        if (entities[i].components.particle.py > 1) entities[i].components.particle.py = entities[i].components.particle.py % 1;

        const screenX: number = entities[i].components.particle.px * renderer.width;
        const screenY: number = entities[i].components.particle.py * renderer.height;

        renderer.setPixel(screenX, screenY, particleColors[entities[i].components.particle.color], particleSize);
    }
});

for (let i = 0; i < particleCount; i++) ecs.createEntity('particle');

clock.run(() => {
    const ecsUpdateTime: number = clock.getExecuteTime(ecs.update.bind(ecs));
    const renderTime: number = clock.getExecuteTime(renderer.render.bind(renderer));

    clock.showStats({
        'frictionHalfLife': frictionHalfLife,
        'particleCount': particleCount,
        'particleTypeCount': particleTypeCount,
        'particleSize': particleSize,
        'maxRadiusFactor': maxRadiusFactor,
        'forceFactor': forceFactor,
        'speedFactor': calcSpeed().toFixed(2),
        'ecs.update(ms)': ecsUpdateTime.toFixed(2),
        'renderer.render(ms)': renderTime.toFixed(2),
    });
});