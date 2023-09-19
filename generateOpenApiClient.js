import { exec } from "child_process";

console.log(
  `Generating OpenAPI client from ${process.env.SST_Parameter_value_HTTP_API}/openapi.yaml`
);

exec(
  `openapi --input ${process.env.SST_Parameter_value_HTTP_API}/openapi.yaml --name Api --postfixServices Api --indent  2 --output common/api`,
  (error, stdout, stderr) => {
    if (error) console.error(error);
    if (stderr) console.error(stderr);
    if (stdout) console.log(stdout);
  }
);
