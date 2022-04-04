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
exports.getDiscordUserData = exports.refreshDiscordTokens = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("./config"));
const axiosInstance = axios_1.default.create({
    baseURL: `https://discord.com/api`,
});
function refreshDiscordTokens(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axiosInstance.post("/token", new URLSearchParams({
            client_id: config_1.default.discordClientId,
            client_secret: config_1.default.discordClientSecret,
            refresh_token: user.discordRefreshToken,
            grant_type: "refresh_token",
        }));
        return response.data;
    });
}
exports.refreshDiscordTokens = refreshDiscordTokens;
function getDiscordUserData(access_token) {
    return new Promise((resolve, reject) => {
        axiosInstance.get("/users/@me", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }).then(response => resolve(response.data)).catch(reject);
    });
}
exports.getDiscordUserData = getDiscordUserData;
