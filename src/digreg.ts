import axios from "axios";
import config from "./config";
import { DB } from "./database";
const axiosInstance = axios.create({
    baseURL: `https://tfobz.digitalesregister.it/v2/api/v1`,
    headers: {
        "API-CLIENT-ID": config.digregClientId,
    }
});

export async function refreshDigregTokens(user: DB.User) {
    const response = await axiosInstance.post("/refresh_token", {
        user_id: user.digregId,
        refresh_token: user.digregRefreshToken
    }, { headers: { "API-SECRET": config.digregClientSecret, } });
    return response.data;
}

export async function getDigregOAuthTokens(code: string) {
    return new Promise<any>((resolve, reject) => {
        axiosInstance.post("/token", { code }, { headers: { "API-SECRET": config.digregClientSecret } }).then(response => resolve(response.data)).catch(reject);
    })
}

export async function getDigregUserData(access_token: string) {
    return new Promise<any>((resolve, reject) => {
        axiosInstance.get("/user/me", {
            headers: {
                "API-TOKEN": access_token,
            },
        }).then(response => resolve(response.data)).catch(reject);
    })
}