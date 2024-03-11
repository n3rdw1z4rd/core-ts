import { Logger } from '.';

const log: Logger = new Logger('[ECS]');

export type SystemCallback = (entity: Entity, components: any) => void;
export type TickCallback = () => void;

export interface System {
    components: string[],
    callback: SystemCallback,
};

export type Component = any;
export type ComponentData = any;

export interface Entity {
    uid: string,
    components: Map<string, Component>,
};

export class EcsEngine {
    private _globals: Map<string, any> = new Map<string, any>();
    private _entities: Map<string, Entity> = new Map<string, Entity>();
    private _components: Map<string, Component> = new Map<string, Component>();
    private _defaultComponents: string[] = [];
    private _systems: Map<string, System> = new Map<string, System>();
    private _onTickStartCallbacks: TickCallback[] = [];
    private _onTickEndCallbacks: TickCallback[] = [];

    public get components(): string[] {
        return [...this._components.keys()];
    }

    public get systems(): string[] {
        return [...this._systems.keys()];
    }

    public get entities(): Entity[] {
        return [...this._entities.values()];
    }

    public uid(length: number = 8): string {
        const numBytes: number = Math.ceil(length / 2);
        const buffer: Uint8Array = new Uint8Array(numBytes);

        window.crypto.getRandomValues(buffer);

        let uid: string = '';

        for (let i = 0; i < buffer.length; i++) {
            uid += buffer[i].toString(16).padStart(2, '0');
        }

        return uid.substring(0, length);
    }

    public createComponent(uid: string, data: ComponentData = null): this {
        if (!this._components.has(uid)) {
            this._components.set(uid, data);
            log.debug('[ECS] created component:', { uid, data });
        } else {
            log.warn('[ECS] createComponent: a component already exists with uid:', uid);
        }

        return this;
    }

    public includeAsDefaultComponents(...components: string[]): this {
        components.forEach((component: string) => {
            if (!this._defaultComponents.includes(component)) {
                this._defaultComponents.push(component);
                log.debug('[ECS] includeAsDefaultComponents:', component);
            } else {
                log.warn('[ECS] includeAsDefaultComponents: already exists:', component);
            }
        });

        return this;
    }

    public createSystem<T extends string[]>(uid: string, ...components: [...T, SystemCallback]): this {
        const callback: SystemCallback = components.pop() as SystemCallback;

        const comps: string[] = components.filter((comp: any) => (typeof comp === 'string')) as string[];

        if (!this._systems.has(uid)) {
            this._systems.set(uid, { components: comps, callback });
            log.debug('[ECS] created system:', { uid, components, callback });
        } else {
            log.warn('[ECS] createSystem: a system already exists with uid:', uid);
        }

        return this;
    }

    public createEntityWithUid(uid: string, ...components: string[]): this {
        if (!this._entities.has(uid)) {
            const componentList: string[] = [
                ...(new Set<string>([
                    ...this._defaultComponents,
                    ...components,
                ]))];

            const comps: Map<string, Component> = new Map<string, Component>();

            componentList.forEach((component: string) => {
                if (this._components.has(component)) {
                    const componentData: any = this._components.get(component);
                    const data: any = {};

                    for (const uid in componentData) {
                        const value = componentData[uid];

                        data[uid] = (typeof value === 'function') ? value() : value;
                    }

                    comps.set(component, data);
                } else {
                    log.warn('[ECS] createEntityWithUid: missing component:', component);
                }
            });

            if (comps.size === componentList.length) {
                const entity: Entity = { uid, components: comps };
                this._entities.set(uid, entity);
                log.debug('[ECS] created entity:', entity);
            } else {
                log.warn('[ECS] createEntityWithUid: failed to create an entity with missing components');
            }
        } else {
            log.warn('[ECS] createEntityWithUid: an entity already exists with uid:', uid);
        }

        return this;
    }

    public createEntity(...components: string[]): this {
        const uid: string = this.uid();

        return this.createEntityWithUid(uid, ...components);
    }

    public createEntities(count: number, ...components: string[]): this {
        for (; count > 0; count--) {
            this.createEntity(...components);
        }

        return this;
    }

    public getEntity(uid: string): Entity | undefined {
        return this._entities.get(uid);
    }

    public getEntitiesWithComponents<T extends string[]>(...components: [...T, filter: any]): Entity[] {
        const filter: any = components.pop() as any;
        const uids: string[] = components.filter((component: any) => typeof component === 'string');

        const entities: Entity[] = []

        this._entities.forEach((entity: Entity) => {
            if (uids.every((component: string) =>
                [...entity.components.keys()].includes(component)
            )) {
                for (const filterComponent in filter) {
                    for (const filterKey in filter[filterComponent]) {
                        const entityValue = entity.components.get(filterComponent)[filterKey];
                        const filterValue = filter[filterComponent][filterKey];

                        if (entityValue === filterValue) {
                            entities.push(entity);
                        }
                    }
                }
            }
        });

        return entities;
    }

    public addComponent(uid: string, component: string, values: any = {}): this {
        const entity: Entity | undefined = this._entities.get(uid);

        if (entity) {
            if (this._components.has(component)) {
                const comp: any = this._components.get(component);

                const componentData: any = {
                    ...comp,
                    ...values,
                };

                entity.components.set(component, componentData);

                log.debug('[ECS] addComponent: added component:', component, 'to entity:', uid);
            } else {
                log.warn('[ECS] addComponent: component not found:', component);
            }
        } else {
            log.warn('[ECS] addComponent: entity not found:', uid);
        }

        return this;
    }

    public onAllEntitiesNow(callback: (entit: Entity) => void): this {
        this._entities.forEach((entity: Entity) => callback(entity));
        log.debug('[ECS] onAllEntitiesNow: executed on all entities:', callback);

        return this;
    }

    public duplicateEntity(uid: string, count: number = 1, deep: boolean = false): this {
        const entity: Entity | undefined = this._entities.get(uid);

        if (entity) {
            if (!deep) {
                for (let i = 0; i < count; i++) this.createEntity(...entity.components.keys());
            } else {
                for (let i = 0; i < count; i++) {
                    const newEntity: Entity = { uid: this.uid(), components: new Map<string, any>() };

                    entity.components.forEach((value: any, key: string) => {
                        newEntity.components.set(key, value);
                    });

                    this._entities.set(newEntity.uid, newEntity);
                };
            }

            log.debug('[ECS] duplicateEntity: duplicated entity:', uid);
        } else {
            log.warn('[ECS] duplicateEntity: entity not found:', uid);
        }

        return this;
    }

    public getGlobal(key: string): any {
        return this._globals.get(key);
    }

    public setGlobal(key: string, value: any): this {
        this._globals.set(key, value);

        return this;
    }

    public beforeTick(callback: TickCallback): this {
        this._onTickStartCallbacks.push(callback);
        log.debug('[ECS] beforeTick: added:', callback);

        return this;
    }

    public afterTick(callback: TickCallback): this {
        this._onTickEndCallbacks.push(callback);
        log.debug('[ECS] afterTick: added:', callback);

        return this;
    }

    public runSystem(uid: string): this {
        const system: System | undefined = this._systems.get(uid);

        if (system) {
            this._entities.forEach((entity: Entity) => {
                if (system.components.every((component: string) =>
                    [...entity.components.keys()].includes(component)
                )) {
                    system.callback(entity, Object.fromEntries(entity.components));
                }
            });
        } else {
            log.warn('[ECS] runSystem: system not found:', uid);
        }

        return this;
    }

    public update(): void {
        this._onTickStartCallbacks.forEach((cb: TickCallback) => cb());
        this._systems.forEach((_: System, uid: string) => this.runSystem(uid));
        this._onTickEndCallbacks.forEach((cb: TickCallback) => cb());
    }

    public static get instance(): EcsEngine {
        if (!EcsEngine._instance) {
            EcsEngine._instance = new EcsEngine();
        }

        return EcsEngine._instance;
    }

    private static _instance: EcsEngine;

    private constructor() { }
}