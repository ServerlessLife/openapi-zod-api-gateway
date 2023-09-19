import { OpenApiService } from "../../core/src/openApi/openApiService";
import * as yaml from "yaml";
import { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from "aws-lambda";
import { Config } from "sst/node/config";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssm = new SSMClient({});
const restApiUrl = await getSsmParameter(
  "/sst/openapi-zod-api-gateway/marko/Parameter/REST_API/value"
);

export const handler = async (
  _evt: APIGatewayProxyEventV2 | APIGatewayProxyEvent
) => {
  // handle both Http or Rest API Gateway events
  let path: string;
  let servers: { url: string; description: string }[];
  let apiGatewayType: "http" | "rest";

  if ("rawPath" in _evt) {
    // Http API Gateway
    apiGatewayType = "http";
    path = _evt.rawPath;
    servers = [{ url: Config.HTTP_API, description: "HTTP API Gateway" }];
  } else {
    // Rest API Gateway
    apiGatewayType = "rest";
    path = _evt.path;
    servers = [{ url: restApiUrl, description: "REST API Gateway" }];
  }

  const openApiDocs = OpenApiService.createOpenApiSchema(
    servers,
    apiGatewayType
  );

  if (path.includes("/openapi.json")) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify(openApiDocs),
    };
  } else if (path.includes("/openapi.yaml")) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/yaml",
        "Cache-Control": "no-store",
      },
      body: yaml.stringify(openApiDocs),
    };
  } else {
    return {
      statusCode: 404,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-store",
      },
      body: "Not Found",
    };
  }
};
async function getSsmParameter(ssmParameter: string) {
  const command = new GetParameterCommand({
    Name: ssmParameter,
  });
  const response = await ssm.send(command);
  const value = response.Parameter?.Value;

  if (!value) {
    throw new Error(`Could not find SSM parameter ${ssmParameter}`);
  }

  return value;
}
