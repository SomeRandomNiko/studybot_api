import { APIUser } from "discord-api-types/v10";
import express, { Request, Response } from "express";
import config from "../shared/config";
import { getDigregUserData } from "../shared/digreg";
import { getDiscordUserData } from "../shared/discord";
import { digreg, discord, requireLogin } from "../middleware";

const userRouter = express.Router();

userRouter.get("/me", requireLogin, discord, digreg(true), getUserController);

async function getUserController(req: Request, res: Response) {
    // get user from discord api
    const promises: Promise<any>[] = [getDiscordUserData(req.discordAccessToken)];
    if (req.digregAccessToken)
        promises.push(getDigregUserData(req.digregAccessToken));

    const [discordUser, digregUser] = await Promise.all(promises);

    res.json(userTransformer(discordUser, digregUser));
}


function userTransformer(discordUser: APIUser, digregUser?: any) {
    const ret = {
        discord: {
            id: discordUser.id,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            avatarUrl: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.discriminator) % 5}.png`,
        }
    }

    if (digregUser) {
        Object.assign(ret, {
            digreg: {
                firstName: digregUser.studentData.firstName,
                lastName: digregUser.studentData.lastName,
                fullName: digregUser.studentData.name,
                isOver18: digregUser.studentData.isLegalResonsible,
                id: digregUser.id,
                role: digregUser.role,
                classId: digregUser.studentData.mainClass.id,
                className: digregUser.studentData.mainClass.name
            }
        });
    }
    return ret;
}


export default userRouter;