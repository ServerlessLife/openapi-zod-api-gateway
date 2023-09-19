import {
  type APIGatewayProxyEvent,
  type APIGatewayProxyHandler,
  type APIGatewayProxyResult,
} from "aws-lambda";
import { ZodError, type ZodType } from "zod";
import { RouteConfig } from "@asteasolutions/zod-to-openapi";
import { OpenApiService } from "@openapi-zod-api-gateway/core/src/openApi/openApiService";
import { ValidationErrorsRest } from "@openapi-zod-api-gateway/core/src/openApi/validationErrorsRest";

/**
 *
 * @param handler
 * @param basePath Use this if you create all endpoints under "/api" or similar
 * @returns
 */
export function openApiLambdaRestHandler<
  TBody = any,
  TPathParameters = any,
  TQueryParameters = any
>(
  handler: (
    data: {
      body: TBody;
      pathParameters: TPathParameters;
      queryParameters: TQueryParameters;
    },
    event: APIGatewayProxyEvent
  ) => Promise<Omit<APIGatewayProxyResult, "body"> & { body: any }>,
  basePath?: string
): APIGatewayProxyHandler {
  return (async (event: APIGatewayProxyEvent) => {
    let path = event.requestContext.resourcePath;
    const registry = OpenApiService.createOpenApiRegistry("rest");
    const requestContentType =
      event.headers["content-type"] ?? "application/json";

    //remove root path from the path
    if (basePath) {
      path = path.replace(basePath, "");
    }

    const route = registry.definitions.find(
      (d) =>
        d.type === "route" &&
        d.route.path === path &&
        d.route.method.toLocaleLowerCase() ===
          event.requestContext.httpMethod.toLocaleLowerCase()
    ) as
      | {
          type: "route";
          route: RouteConfig;
        }
      | undefined;

    if (!route) {
      throw new Error(`Route not found: ${path} in OpenAPI spec`);
    }

    const zodTypeBody = route.route.request?.body?.content[requestContentType]
      ?.schema as ZodType;

    let body: TBody | undefined;
    if (zodTypeBody) {
      const validation = zodTypeBody.safeParse(JSON.parse(event.body ?? "{}"));

      if (validation.success) {
        body = validation.data;
      } else {
        console.error("SHEMA_ERROR_BODY", validation.error.errors);
        return {
          statusCode: 400,
          body: JSON.stringify(
            ValidationErrorsRest.parse({
              message: getValidationMessage(validation.error),
            })
          ),
          headers: {
            "Content-Type": "application/json",
          },
        };
      }
    }

    const zodTypeParams = route.route.request?.params as ZodType;

    let pathParameters: TPathParameters | undefined;
    if (zodTypeParams) {
      const validation = zodTypeParams.safeParse(event.pathParameters);
      if (validation.success) {
        pathParameters = validation.data;
      } else {
        console.error("SHEMA_ERROR_PATH", validation.error.errors);
        return {
          statusCode: 400,
          body: JSON.stringify(
            ValidationErrorsRest.parse({
              message: getValidationMessage(validation.error),
            })
          ),
          headers: {
            "Content-Type": "application/json",
          },
        };
      }
    }

    const zodTypeQuery = route.route.request?.query as ZodType;

    let queryParameters: TQueryParameters | undefined;
    if (zodTypeQuery) {
      const validation = zodTypeQuery.safeParse(event.queryStringParameters);
      if (validation.success) {
        queryParameters = validation.data;
      } else {
        console.error("SHEMA_ERROR_QUERY", validation.error.errors);
        return {
          statusCode: 400,
          body: JSON.stringify(
            ValidationErrorsRest.parse({
              message: getValidationMessage(validation.error),
            })
          ),
          headers: {
            "Content-Type": "application/json",
          },
        };
      }
    }

    const response = await handler(
      {
        body: body as TBody,
        pathParameters: pathParameters as TPathParameters,
        queryParameters: queryParameters as TQueryParameters,
      },
      event
    );
    let responseContentType: string | undefined;

    if (response.headers) {
      const contentTypeHeader = Object.keys(response.headers).find(
        (header) => header.toLocaleLowerCase() === "content-type"
      );

      if (contentTypeHeader) {
        responseContentType = response.headers[contentTypeHeader] as string;
      }
    }

    const openApiResponse =
      route.route.responses[response.statusCode?.toString() ?? ""];

    if (!openApiResponse) {
      throw new Error(`Response not found: ${response.statusCode} in OpenAPI`);
    }

    if (!responseContentType) {
      if (
        !openApiResponse?.content ||
        Object.keys(openApiResponse.content).length === 0
      ) {
        // there is not content-type header in the response by openapi spec
      } else {
        throw new Error(`Content-Type header not found in response`);
      }
    }

    if (responseContentType) {
      const zodTypeResponse = openApiResponse?.content
        ? (openApiResponse.content[responseContentType]?.schema as ZodType)
        : undefined;

      if (zodTypeResponse) {
        const validation = zodTypeResponse.safeParse(response.body);
        if (validation.success) {
          response.body = validation.data;
        } else {
          console.error("SHEMA_ERROR_RESPONSE", validation.error);
          throw new Error(
            `Response body not valid: ${validation.error.message} by OpenAPI schema.`
          );
        }
      }
    }

    return {
      ...response,
      body: JSON.stringify(response.body),
    };
  }) as APIGatewayProxyHandler;
}

function getValidationMessage(error: ZodError<any>) {
  if (error.errors.length === 0) {
    return "Validation error";
  }

  const firstError = error.errors[0];

  if (firstError.path.length === 0) {
    return firstError.message;
  } else {
    return `${firstError.path.join(".")}: ${firstError.message}`;
  }
}
