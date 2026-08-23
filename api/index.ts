import type { Request, Response } from 'express';
import { returnApp } from '../server.cjs';

let appPromise: ReturnType<typeof returnApp> | undefined;

export default async function handler(req: Request, res: Response) {
	appPromise ??= returnApp();
	const app = await appPromise;
	app(req, res);
}