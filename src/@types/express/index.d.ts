declare global {
    namespace Express {
        interface Request {
            discordId: string;
            digregAccessToken: string;
        }
    }
}

export {};