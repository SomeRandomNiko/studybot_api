"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.digreg = exports.discord = exports.requireLogin = exports.errorHandler = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("./config"));
const database = __importStar(require("./database"));
const digreg_1 = require("./digreg");
const discord_1 = require("./discord");
function errorHandler(err, req, res, next) {
    res.status(err.status).json({ message: err.message });
}
exports.errorHandler = errorHandler;
// express middleware function that decodes the bearer token
function requireLogin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return next({ status: 401, message: 'No authentication header' });
    const token = authHeader.split(' ')[1];
    if (!token)
        return next({ status: 401, message: 'No token provided' });
    jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret, (err, decoded) => {
        if (err)
            return next({ status: 401, message: 'Token invalid' });
        req.discordId = decoded.discordId;
        next();
    });
}
exports.requireLogin = requireLogin;
function discord(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.discordId)
            return next({ status: 500, message: 'Middleware requireDiscord requires requireLogin before it' });
        const user = yield database.getUser(req.discordId);
        if (!user)
            return next({ status: 404, message: 'User not found' });
        let accessToken = user.discordAccessToken;
        if (user.discordTokenExpires && user.discordTokenExpires.getTime() < Date.now()) {
            const newTokens = yield (0, discord_1.refreshDiscordTokens)(user);
            if (!newTokens)
                return next({ status: 500, message: 'Failed to refresh Discord tokens' });
            yield database.setDiscordTokens(user.discordId, newTokens.access_token, newTokens.refresh_token, new Date(Date.now() + newTokens.expires_in * 1000));
            accessToken = newTokens.access_token;
        }
        req.discordAccessToken = accessToken;
        next();
    });
}
exports.discord = discord;
function digreg(optional = false) {
    return function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.discordId)
                return next({ status: 500, message: 'Middleware requreDigreg requires requireLogin before it' });
            const user = yield database.getUser(req.discordId);
            if (!user)
                return next({ status: 404, message: 'User not found' });
            if (!user.digregConnected)
                return next(optional ? undefined : { status: 403, message: 'User is not connected to digreg' });
            let accessToken = user.digregAccessToken;
            // If the digreg token is expired, refresh it
            if (user.digregTokenExpires && user.digregTokenExpires.getTime() < Date.now()) {
                const newTokens = yield (0, digreg_1.refreshDigregTokens)(user);
                if (!newTokens)
                    return next({ status: 500, message: 'Failed to refresh digreg tokens' });
                yield database.setDigregTokens(user.discordId, newTokens.token, new Date(newTokens.expiration));
                accessToken = newTokens.token;
            }
            req.digregAccessToken = accessToken || "";
            next();
        });
    };
}
exports.digreg = digreg;
