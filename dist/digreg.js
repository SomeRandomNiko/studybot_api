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
exports.getDigregGrades = exports.getDigregUserData = exports.refreshDigregTokens = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("./config"));
const axiosInstance = axios_1.default.create({
    baseURL: `https://tfobz.digitalesregister.it/v2/api/v1`,
    headers: {
        "API-CLIENT-ID": config_1.default.digregClientId,
    }
});
function refreshDigregTokens(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axiosInstance.post("/refresh_token", {
            user_id: user.digregId,
            refresh_token: user.digregRefreshToken
        }, { headers: { "API-SECRET": config_1.default.digregClientSecret, } });
        return response.data;
    });
}
exports.refreshDigregTokens = refreshDigregTokens;
function getDigregUserData(access_token) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            axiosInstance.get("/user/me", {
                headers: {
                    "API-TOKEN": access_token,
                },
            }).then(response => resolve(response.data)).catch(reject);
        });
    });
}
exports.getDigregUserData = getDigregUserData;
function getDigregGrades(access_token) {
    return new Promise((resolve, reject) => {
        axiosInstance.get("/grade/my_grades", {
            headers: {
                "API-TOKEN": access_token,
            },
        }).then(response => resolve(response.data)).catch(reject);
    });
}
exports.getDigregGrades = getDigregGrades;
