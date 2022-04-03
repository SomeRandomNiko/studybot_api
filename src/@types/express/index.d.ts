declare global {
    namespace Express {
        interface Request {
            discordId: string;
        }
    }
}

export {};