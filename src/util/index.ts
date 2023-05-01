import * as discord from "./discord";
import * as calendar from "./calendar";
import * as notion from "./notion";

import totp from "totp-generator";
import { NextApiRequest } from "next";

const verifyAuth = async (req: NextApiRequest) => {
  return new Promise((resolve, reject) => {
    const authToken = req.headers?.authorization;
    if (!authToken) {
      reject("Missing auth token");
    } else if (!validateAuthToken(authToken)) {
      reject("Invalid auth token");
    }
    resolve(null);
  });
};

/**
 * Use our TOTP key to validate the rotating bearer token is valid to ensure the client has the secret key that changes every 10 seconds
 * @param token
 * @returns
 */
const validateAuthToken = (token: string) => {
  if (process.env.NODE_ENV === "development") return true;

  const validateFormat = token.match(/^Bearer .{8}$/g);
  if (validateFormat?.length !== 1) return false;
  const accessToken = token.split(" ")[1];
  const key = process.env.TOTP_KEY as string;
  const totpValue = totp(key, {
    digits: 8,
    algorithm: "SHA-512",
    period: 10,
  });
  return accessToken === totpValue;
};

export { discord, calendar, notion, verifyAuth };
