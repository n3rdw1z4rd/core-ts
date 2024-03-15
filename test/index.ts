// import './particles1';
// import './particles2';
// import './particles3';

import { Color, clamp } from '../src';

function hsvToRgba(h: number, s: number, v: number, a: number): number[] {
    h = (h % 1 + 1) % 1;
    s = clamp(s, 0, 1);
    v = clamp(v, 0, 1);

    const i: number = (0 | (h * 6));
    const f: number = h * 6 - i;
    const p: number = v * (1 - s);
    const q: number = v * (1 - f * s);
    const t: number = v * (1 - (1 - f) * s);

    let r: number;
    let g: number;
    let b: number;

    switch (i % 6) {
        case 0: [r, g, b] = [v, t, p];
        case 1: [r, g, b] = [q, v, p];
        case 2: [r, g, b] = [p, v, t];
        case 3: [r, g, b] = [p, q, v];
        case 4: [r, g, b] = [t, p, v];
        case 5: [r, g, b] = [v, p, q];
        default: [r, g, b] = [v, p, q];
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
}

const m = 6;
const color = Math.floor(Math.random() * m);
console.debug('color:', color);
const h = 360 * (color / m);

const div1: HTMLDivElement = document.createElement('div');
div1.style.setProperty('width', '100px');
div1.style.setProperty('height', '100px');
div1.style.setProperty('background-color', `hsl(${h}, 100%, 50%)`);
document.body.appendChild(div1);

const div2: HTMLDivElement = document.createElement('div');
div2.style.setProperty('width', '100px');
div2.style.setProperty('height', '100px');
div2.style.setProperty('background-color', `rgba(${hsvToRgba(h, 1.0, 1.0, 255).join(',')})`);
document.body.appendChild(div2);

const backgroundColor1: CSSStyleValue = div1.computedStyleMap().get('background-color')!;
console.debug('div.style.backgroundColor:', backgroundColor1.toString());

const backgroundColor2: CSSStyleValue = div2.computedStyleMap().get('background-color')!;
console.debug('div.style.backgroundColor:', backgroundColor2.toString());

console.debug('Color.HSV:', Color.HSV(h, 1.0, 1.0, 255).rgba);