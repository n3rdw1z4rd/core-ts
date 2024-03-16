import { DEV } from './env';

export class Logger {
    constructor(
        public prefix: string = '',
        public traceEnabled: boolean = false,
        public tracePrefix: string = '»',
    ) { }

    todo(...args: any[]): void {
        if (DEV) console.debug(
            '%c[TODO]%c ' + args.join(' '),
            'color: black; background-color: yellow; font-weight: bold;',
            'font-weight: bold;',
        );
    }

    trace(...args: any[]): void {
        if (DEV && this.traceEnabled) console.log(this.prefix, this.tracePrefix, ...args);
    }

    debug(...args: any[]): void {
        if (DEV) console.debug(this.prefix, ...args);
    }

    info(...args: any[]): void {
        console.info(this.prefix, ...args);
    }

    warn(...args: any[]): void {
        console.warn(this.prefix, ...args);
    }

    error(...args: any[]): void {
        console.error(this.prefix, ...args);
    }

    throw(...args: any[]): void {
        throw `[${this.prefix}] ${args.join(' ')}`;
    }
}