import { Logger } from './logger';

const logger: Logger = new Logger('[ECS]');

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
    private _entities: Entity[] = [];
    private _components: Map<string, Component> = new Map<string, Component>();
    private _systems: System[] = [];

    public createComponent(name: string, data: object) {
        this._components.set(name, data);
    }

    public createSystem<T extends string[]>(name: string, ...components: [...T, SystemCallback]): this {
        const callback: SystemCallback = components.pop() as SystemCallback;

        if (!this._systems.find((system) => system.name === name)) {
            const system: System = {
                name,
                components: components.filter((comp: any) => (typeof comp === 'string')) as string[],
                callback
            };

            this._systems.push(system);

            logger.debug(`[ECS] created system '${system.name}', components:`, system.components);
        } else {
            logger.warn('[ECS] createSystem: a system already exists with uid:', name);
        }

        return this;
    }

    public createEntity(...components: string[]): void {
        const entity: Entity = {
            id: this._entities.length,
            components: new Map<string, Component>(),
        };

        components.forEach((name) => {
            const component: Component | undefined = this._components.get(name);

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

        this._entities.push(entity);
    }

    public update(): void {
        for (let i = 0; i < this._systems.length; i++) {
            const system: System = this._systems[i];

            const entities: Entity[] = this._entities.filter((entity) => {
                return system.components.every((component) => entity.components.has(component));
            });

            system.callback(entities);
        }
    }
}