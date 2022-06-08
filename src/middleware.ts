import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from './shared/config';
import * as database from './shared/database';
import { refreshDigregTokens } from './shared/digreg';

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

export function digreg(optional = false) {
    return async function (req: Request, res: Response, next: NextFunction) {
        if (!req.discordId)
            return next({ status: 500, message: 'Middleware requreDigreg requires requireLogin before it' });

        const user = await database.getUser(req.discordId);
        if (!user)
            return next({ status: 404, message: 'User not found' });

        if (!user.digregConnected)
            return next(optional ? undefined : { status: 403, message: 'User is not connected to digreg' });

        let accessToken = user.digregAccessToken;


        // If the digreg token is expired, refresh it
        if (user.digregTokenExpires && user.digregTokenExpires.getTime() < Date.now()) {
            const newTokens = await refreshDigregTokens(user);
            if (!newTokens)
                return next({ status: 500, message: 'Failed to refresh digreg tokens' });

            await database.setDigregTokens(user.discordId, newTokens.token, new Date(newTokens.expiration));

            accessToken = newTokens.token;
        }

        req.digregAccessToken = accessToken || "";

        next();
    }
}