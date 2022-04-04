import express, { Request, Response } from "express";
import config from "../config";

const loginRouter = express.Router();

loginRouter.get("/discord", redirectDiscordLogin);
loginRouter.get("/digreg", redirectDigregLogin);


function redirectDiscordLogin(req: Request, res: Response) {
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${config.discordClientId}&redirect_uri=${config.discordRedirectUri}&response_type=code&scope=identify`);
}

function redirectDigregLogin(req: Request, res: Response) {
    res.redirect(`https://tfobz.digitalesregister.it/v2/login?client_id=${config.digregClientId}`);
}

export default loginRouter;