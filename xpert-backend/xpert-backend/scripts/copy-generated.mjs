import { cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const source = resolve(projectRoot, 'src/generated');
const destination = resolve(projectRoot, 'dist/generated');

await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
