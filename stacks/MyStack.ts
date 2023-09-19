import { StackContext, Api, Function, Config } from "sst/constructs";
import * as openapix from "@alma-cdk/openapix";
import * as yaml from "yaml";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import { OpenApiService } from "../packages/core/src/openApi/openApiService";

export function API({ stack }: StackContext) {
  const openApiFunction = new Function(stack, "open-api", {
    handler: "packages/functions/src/openApi.handler",
  });

  const openApiDocsFunction = new Function(stack, "open-api-docs", {
    handler: "packages/functions/src/openApiDocs.handler",
    copyFiles: [
      {
        from: "packages/functions/src/openApi.html",
        to: "packages/functions/src/openApi.html",
      },
    ],
  });

  const httpApi = new Api(stack, "api", {
    routes: {
      "GET /openapi.json": openApiFunction,
      "GET /openapi.yaml": openApiFunction,
      "GET /docs": openApiDocsFunction,
      "PUT /customer/{id}": "packages/functions/src/updateCustomerHttp.handler",
    },
  });

  const updateCustomerFunction = new Function(stack, "update-customer", {
    handler: "packages/functions/src/updateCustomerRest.handler",
  });

  const openApiYaml = yaml.stringify(
    OpenApiService.createOpenApiSchema([], "rest")
  );

  const restApi = new openapix.Api(stack, "rest-api", {
    source: openapix.Schema.fromInline(openApiYaml),
    validators: {
      all: {
        validateRequestBody: true,
        validateRequestParameters: true,
        default: true,
      },
    },
    paths: {
      "/openapi.json": {
        get: new openapix.LambdaIntegration(stack, openApiFunction),
      },
      "/openapi.yaml": {
        get: new openapix.LambdaIntegration(stack, openApiFunction),
      },
      "/docs": {
        get: new openapix.LambdaIntegration(stack, openApiDocsFunction),
      },
      "/customer/{id}": {
        put: new openapix.LambdaIntegration(stack, updateCustomerFunction),
      },
    },
  });

  // Add Gateway Responses to get more detailed error messages
  restApi.addGatewayResponse("BadRequestBody", {
    type: apigateway.ResponseType.BAD_REQUEST_BODY,
    responseHeaders: {
      "Access-Control-Allow-Origin": "'*'",
    },
    templates: {
      "application/json": JSON.stringify({
        message: "$context.error.validationErrorString",
      }),
    },
  });
  restApi.addGatewayResponse("BadRequestParameters", {
    type: apigateway.ResponseType.BAD_REQUEST_PARAMETERS,
    responseHeaders: {
      "Access-Control-Allow-Origin": "'*'",
    },
    templates: {
      "application/json": JSON.stringify({
        message: "$context.error.validationErrorString",
      }),
    },
  });

  const cfnRestApi = restApi.node.defaultChild as apigateway.CfnRestApi;
  const restApiUrl = `https://${cfnRestApi.ref}.execute-api.${stack.region}.${stack.urlSuffix}/${restApi.deploymentStage.stageName}`;

  const httpApiUrlConfig = new Config.Parameter(stack, "HTTP_API", {
    value: httpApi.url,
  });

  new Config.Parameter(stack, "REST_API", {
    value: restApiUrl,
  });

  openApiFunction.bind([httpApiUrlConfig]);

  // Can not set REST_API as environment variable because of circular dependency issue.
  // I read it from SSM Parameter Store instead.
  // I need to grant access:
  openApiFunction.role?.attachInlinePolicy(
    new iam.Policy(stack, "ssm-policy", {
      statements: [
        new iam.PolicyStatement({
          actions: ["ssm:GetParameter"],
          resources: [
            `arn:aws:ssm:${stack.region}:${stack.account}:parameter/sst/openapi-zod-api-gateway/marko/Parameter/REST_API/value`,
          ],
        }),
      ],
    })
  );

  stack.addOutputs({
    HttpApi: httpApi.url,
    RestApi: restApiUrl,
  });
}
