import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from './config';
import * as database from './database';
import { refreshDigregTokens } from './digreg';
import { refreshDiscordTokens } from './discord';

interface ErrorResponse {
    message: string;
    status: number;
}

export function errorHandler(err: ErrorResponse, req: Request, res: Response, next: NextFunction) {
    res.status(err.status).json({ message: err.message });
}

// express middleware function that decodes the bearer token
export function requireLogin(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return next({ status: 401, message: 'No authentication header' });

    const token = authHeader.split(' ')[1];
    if (!token)
        return next({ status: 401, message: 'No token provided' });

    jwt.verify(token, config.jwtSecret, (err, decoded: any) => {
        if (err)
            return next({ status: 401, message: 'Token invalid' });

        req.discordId = decoded.discordId;
        next();
    });
}

export async function requireDiscord(req: Request, res: Response, next: NextFunction) {
    if (!req.discordId)
    return next({ status: 500, message: 'Middleware requireDiscord requires requireLogin before it' });

    const user = await database.getUser(req.discordId);
    if (!user)
        return next({ status: 404, message: 'User not found' });

    if(user.discordTokenExpires && user.discordTokenExpires.getTime() < Date.now()) {
        const newTokens = await refreshDiscordTokens(user);
        if (!newTokens)
            return next({ status: 500, message: 'Failed to refresh Discord tokens' });

        await database.setDiscordTokens(user.discordId, newTokens.access_token, newTokens.refresh_token, new Date(Date.now() + newTokens.expires_in * 1000));
    }
    next();
}

export async function requireDigreg(req: Request, res: Response, next: NextFunction) {
    if (!req.discordId)
        return next({ status: 500, message: 'Middleware requreDigreg requires requireLogin before it' });

    const user = await database.getUser(req.discordId);
    if (!user)
        return next({ status: 404, message: 'User not found' });

    if (!user.digregConnected)
        return next({ status: 403, message: 'User is not connected to digreg' });


    // If the digreg token is expired, refresh it
    if (user.digregTokenExpires && user.digregTokenExpires.getTime() < Date.now()) {
        const newTokens = await refreshDigregTokens(user);
        if (!newTokens)
            return next({ status: 500, message: 'Failed to refresh digreg tokens' });

        await database.setDigregTokens(user.discordId, newTokens.token, new Date(newTokens.expiration));
    }
    next();
}