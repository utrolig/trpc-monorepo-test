import { ApplicationConfig } from "../config";
import fetch from "node-fetch";
import urljoin from "url-join";

export type OAuthData = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
};

export type DiscordUser = {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  public_flags: number;
  flags: number;
  banner: string | null;
  banner_color: string;
  accent_color: number;
  locale: string;
  mfa_enabled: boolean;
  premium_type: number;
};

export type ExchangeCodeForTokenOptions = {
  code: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
};

export async function exchangeCodeForToken({
  client_id,
  client_secret,
  code,
  redirect_uri,
}: ExchangeCodeForTokenOptions) {
  const oauthResult = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id,
      client_secret,
      code,
      grant_type: "authorization_code",
      redirect_uri,
      scope: "identify",
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!oauthResult.ok) {
    const jsonbody = await oauthResult.json();
    throw new Error(
      JSON.stringify({
        message: `${oauthResult.status} Error while exchanging code for access_token.`,
        statusText: oauthResult.statusText,
        status: oauthResult.status,
        body: jsonbody,
      })
    );
  }

  const oauthData = (await oauthResult.json()) as OAuthData;

  const userData = await fetchDiscordUserData(oauthData.access_token);

  return {
    ...oauthData,
    profile: userData,
  };
}

export const fetchDiscordUserData = async (accessToken: string) => {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.json();
    throw new Error(text);
  }

  const userData = (await response.json()) as DiscordUser;
  return userData;
};

export const createRedirectUrl = (config: ApplicationConfig, path: string) => {
  return urljoin(config.SERVER_URL, path);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toBase64UrlState = (state: any) => {
  try {
    return Buffer.from(JSON.stringify(state)).toString("base64url");
  } catch (err) {
    throw new Error("Error while converting to base64 string");
  }
};

export function parseBase64UrlState<T>(base64string: string) {
  try {
    const jsonString = Buffer.from(base64string, "base64url").toString();
    const parsed = JSON.parse(jsonString);
    return parsed as T;
  } catch (err) {
    throw new Error("Error while parsing base64 string");
  }
}
