import '../src/css/reset.css';
import '../src/css/my-styles.css';
import { Clock, DEV, Emitter, Logger, clamp, rng } from '../src';

const logger: Logger = new Logger('[Test]');
logger.traceEnabled = true;
logger.trace('Logger.trace() test');
logger.debug('Logger.debug() test');
logger.info('Logger.info() test');
logger.warn('Logger.warn() test');
logger.error('Logger.error() test');


const clock: Clock = new Clock();
console.log('*** Clock:', clock);
setTimeout(() => clock.stop(), 100);
clock.run((deltaTime: number) => logger.debug('Clock.run: deltaTime:', deltaTime));

const emitter: Emitter = new Emitter();
emitter.on('test', (data: any) => logger.debug('Emitter.on() test:', data));
emitter.emit('test', 'Test Data');

logger.debug('math.clamp(0, 10, 5):', clamp(0, 10, 5));

for (let i = 0; i < 10; i++) {
    logger.debug('rng():', rng());
}
rng(42);
for (let i = 0; i < 10; i++) {
    logger.debug('rng() (seed:42):', rng());
}

logger.todo('*** TODO: Add test for CanvasRenderer ***');
logger.todo('*** TODO: Add test for WebGLRenderer ***');

// logger.throw('Logger.throw() test');