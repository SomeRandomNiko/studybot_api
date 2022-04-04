import axios from "axios";
import config from "./config";
import { DB } from "./database";
const axiosInstance = axios.create({
    baseURL: `https://tfobz.digitalesregister.it/v2/api/v1`,
    headers: {
        "API-CLIENT-ID": config.digregClientId,
        "API-SECRET": config.digregClientSecret,
    }
});

export async function refreshDigregTokens(user: DB.User) {
    const response = await axiosInstance.post("/refresh_token", {
        user_id: user.digregId,
        refresh_token: user.digregRefreshToken
    });
    return response.data;
}

export async function getDigregOAuthTokens(code: string) {
    return new Promise<any>((resolve, reject) => {
        axiosInstance.post("/token", { code }).then(response => resolve(response.data)).catch(reject);
    })
}