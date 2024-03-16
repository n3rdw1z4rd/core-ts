export const ENV: string = process?.env?.NODE_ENV?.toLowerCase() ?? 'production';
export const DEV: boolean = (ENV !== 'production');