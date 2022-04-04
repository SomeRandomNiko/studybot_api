"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const digreg_1 = require("../digreg");
const discord_1 = require("../discord");
const middleware_1 = require("../middleware");
const userRouter = express_1.default.Router();
userRouter.get("/me", middleware_1.requireLogin, middleware_1.discord, (0, middleware_1.digreg)(true), getUserController);
function getUserController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // get user from discord api
        const promises = [(0, discord_1.getDiscordUserData)(req.discordAccessToken)];
        if (req.digregAccessToken)
            promises.push((0, digreg_1.getDigregUserData)(req.digregAccessToken));
        const [discordUser, digregUser] = yield Promise.all(promises);
        res.json(userTransformer(discordUser, digregUser));
    });
}
function userTransformer(discordUser, digregUser) {
    const ret = {
        discord: {
            id: discordUser.id,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            avatarUrl: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`,
        }
    };
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
exports.default = userRouter;
