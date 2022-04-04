import axios, { AxiosError } from "axios";
import config from "./config";
import { DB } from "./database";
import { APIUser, RESTGetAPIUserResult, RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
const axiosInstance = axios.create({
    baseURL: `https://discord.com/api`,
});

export async function refreshDiscordTokens(user: DB.User) {
    const response = await axiosInstance.post<RESTPostOAuth2AccessTokenResult>("/token", new URLSearchParams({
        client_id: config.discordClientId,
        client_secret: config.discordClientSecret,
        refresh_token: user.discordRefreshToken,
        grant_type: "refresh_token",
    }));
    return response.data;
}

export function getDiscordUserData(access_token: string) {
    return new Promise<APIUser>((resolve, reject) => {
        axiosInstance.get<RESTGetAPIUserResult>("/users/@me", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }).then(response => resolve(response.data)).catch(reject);
    })
}