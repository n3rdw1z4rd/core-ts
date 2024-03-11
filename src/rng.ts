let __seed__: number = Date.now();

export const rng = (seed?: number): number => {
    __seed__ = seed || __seed__ || Date.now();

    // adapted from: https://github.com/bryc/code/blob/master/jshash/PRNGs.md#splitmix32
    __seed__ |= 0;
    __seed__ = __seed__ + 0x9e3779b9 | 0;

    let t: number = __seed__ ^ __seed__ >>> 16;
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ t >>> 15;
    t = Math.imul(t, 0x735a2d97);

    return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
};