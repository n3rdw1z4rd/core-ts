import '../src/css/reset.css';
import '../src/css/my-styles.css';
import { CanvasRenderer, Clock, Color, ECS, Logger, rng } from '../src';

const log: Logger = new Logger('[Test]');
// logger.traceEnabled = true;
log.info('*** test/index.ts ***');

const clock: Clock = new Clock();

const renderer: CanvasRenderer = new CanvasRenderer();
renderer.appendTo(document.body);

const infoDiv: HTMLDivElement = document.createElement('div');
infoDiv.style.position = 'absolute';
infoDiv.style.top = '5px';
infoDiv.style.right = '5px';
infoDiv.style.padding = '4px';
infoDiv.style.color = '#ffffffff';
infoDiv.style.backgroundColor = '#000000ff';
infoDiv.style.borderRadius = '4px';
infoDiv.style.border = '1px solid #666666ff';
document.body.appendChild(infoDiv);

const ecs: ECS = new ECS();

// Components:
ecs.createComponent('position', {
    x: () => rng.range(renderer.width),
    y: () => rng.range(renderer.height),
});

ecs.createComponent('velocity', {
    dx: 0,//() => rng.nextf * 2 - 1,
    dy: 0,//()) => rng.nextf * 2 - 1,
});

ecs.createComponent('appearance', {
    type: () => rng.choose(0, 1),
    color: () => rng.choose(
        Color.RED,
        Color.YELLOW,
    ),
    size: 2
});

// Systems:
ecs.createSystem('movement', 'position', 'velocity', (entities: any[]) => {
    log.trace('movement system:', entities.length);

    for (const entity of entities) {
        const position = entity.components.get('position');
        const velocity = entity.components.get('velocity');

        const tx: number = position.x + velocity.dx;
        const ty: number = position.y + velocity.dy;

        if (tx < 0 || tx > renderer.width) velocity.dx *= -1;
        if (ty < 0 || ty > renderer.height) velocity.dy *= -1;

        position.x += velocity.dx;
        position.y += velocity.dy;
    }
});

ecs.createSystem('rendering', 'position', 'appearance', (entities: any[]) => {
    log.trace('rendering system:', entities.length);
    for (const entity of entities) {
        const position = entity.components.get('position');
        const appearance = entity.components.get('appearance');

        renderer.setPixel(position.x, position.y, appearance.color, appearance.size);
    }
});

for (let i = 0; i < 2000; i++) {
    ecs.createEntity('position', 'velocity', 'appearance');
}

log.debug('entities:', ecs.entities);

clock.run((deltaTime: number) => {
    ecs.update();
    renderer.render();
    infoDiv.innerText = [
        `systems: ${ecs.systems.length}`,
        `components: ${ecs.components.size}`,
        `entities: ${ecs.entities.length}`,
        `fps: ${clock.fps.toFixed(2)}`,
    ].join('\n');
});