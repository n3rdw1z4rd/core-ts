import { Logger } from './logger';

const log: Logger = new Logger('[ECS]');

export type Component = any;

export interface Entity {
    id: number;
    components: Map<string, Component>;
}

export type SystemCallback = (entities: Entity[]) => void;

export interface System {
    name: string,
    components: string[],
    callback: SystemCallback,
}

export class ECS {
    entities: Entity[] = [];
    components: Map<string, Component> = new Map<string, Component>();
    systems: System[] = [];

    public createComponent(name: string, data: object) {
        this.components.set(name, data);
    }

    public createSystem<T extends string[]>(name: string, ...components: [...T, SystemCallback]): this {
        const callback: SystemCallback = components.pop() as SystemCallback;

        if (!this.systems.find((system) => system.name === name)) {
            const system: System = {
                name,
                components: components.filter((comp: any) => (typeof comp === 'string')) as string[],
                callback
            };

            this.systems.push(system);

            log.debug(`[ECS] created system '${system.name}', components:`, system.components);
        } else {
            log.warn('[ECS] createSystem: a system already exists with uid:', name);
        }

        return this;
    }

    public createEntity(...components: string[]): void {
        const entity: Entity = {
            id: this.entities.length,
            components: new Map<string, Component>(),
        };

        components.forEach((name) => {
            const component: Component | undefined = this.components.get(name);

            if (component) {
                const data: Component = {};

                for (let [key, value] of Object.entries(component)) {
                    if (typeof value === 'function') {
                        value = value();
                    }

                    data[key] = value;
                }

                entity.components.set(name, data);
            }
        });

        this.entities.push(entity);
    }

    public update(): void {
        for (let i = 0; i < this.systems.length; i++) {
            const system: System = this.systems[i];

            const entities: Entity[] = this.entities.filter((entity) => {
                return system.components.every((component) => entity.components.has(component));
            });

            system.callback(entities);
        }
    }
}