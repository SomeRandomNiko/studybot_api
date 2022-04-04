declare global {
    namespace Express {
        interface Request {
            discordId: string;
            discordAccessToken: string;
            digregAccessToken: string;
        }
    }
}

export {};