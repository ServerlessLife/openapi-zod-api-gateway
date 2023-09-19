import { ApiHandler } from "sst/node/api";
import * as fs from "fs/promises";

export const handler = async () => {
  const file = await fs.readFile("packages/functions/src/openApi.html", {
    encoding: "utf8",
  });
  const maxAge = 10;
  return {
    statusCode: 200,
    body: file,
    headers: {
      "Content-Type": "text/html",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Max-Age": maxAge,
      "Cache-Control": `public, must-revalidate, s-maxage=${maxAge}, max-age=${maxAge}`,
      "x-access-token": true,
    },
  };
};
