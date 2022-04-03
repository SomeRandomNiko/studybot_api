import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from './config';
import * as database from './database';
import { refreshDigregTokens } from './digreg';

// express middleware function that decodes the bearer token
export function requireLogin(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return sendNoTokenError(res);

    const token = authHeader.split(' ')[1];
    if (!token)
        return sendNoTokenError(res);

    jwt.verify(token, config.jwtSecret, (err, decoded: any) => {
        if (err)
            return sendNoTokenError(res);

        req.discordId = decoded.discordId;
        next();
    });
}

function sendNoTokenError(res: Response) {
    res.status(401).json({
        message: 'No token provided'
    });
}

export async function requireDigreg(req: Request, res: Response, next: NextFunction) {
    if (!req.discordId)
        return sendNoTokenError(res);

    const user = await database.getUser(req.discordId);
    if (!user)
        return sendNoTokenError(res);

    if (!user.digregConnected)
        return res.status(403).json({
            message: 'User is not connected to digreg'
        });

    // If the digreg token is expired, refresh it
    if (user.digregTokenExpires && user.digregTokenExpires.getTime() < Date.now()) {
        const newTokens = await refreshDigregTokens(user);
        if (!newTokens)
            return res.status(500).json({
                message: 'Failed to refresh digreg token'
            });

        await database.setDigregTokens(user.discordId, newTokens.token, new Date(newTokens.expiration));
    }
    next();
}