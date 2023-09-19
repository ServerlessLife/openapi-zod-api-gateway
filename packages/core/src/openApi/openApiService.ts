export * as OpenApiService from "./openApiService";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { UpdateCustomer } from "./updateCustomer";
import { UpdateCustomerParams } from "./updateCustomerParams";
import { Customer } from "../types/customer";
import { OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { UpdateCustomerQueryParams } from "./updateCustomerQueryParams";
import { ValidationErrorsHttp } from "./validationErrorsHttp";
import { ValidationErrorsRest } from "./validationErrorsRest";

export function createOpenApiRegistry(apiGatewayType: "http" | "rest") {
  const registry = new OpenAPIRegistry();
  const UpdateCustomerRequestSchema = registry.register(
    "UpdateCustomerRequest",
    UpdateCustomer
  );
  const UpdateCustomerParamsSchema = registry.register(
    "UpdateCustomerParams",
    UpdateCustomerParams
  );
  const UpdateCustomerQueryParamesSchema = registry.register(
    "UpdateCustomerQueryParams",
    UpdateCustomerQueryParams
  );
  const UpdateCustomerResponseSchema = registry.register(
    "UpdateCustomerResponse",
    Customer
  );

  let ValidationErrorsSchema: z.ZodType;

  if (apiGatewayType === "http") {
    ValidationErrorsSchema = registry.register(
      "ValidationErrors",
      ValidationErrorsHttp
    );
  } else {
    ValidationErrorsSchema = registry.register(
      "ValidationErrors",
      ValidationErrorsRest
    );
  }

  registry.registerPath({
    method: "put",
    path: "/customer/{id}",
    summary: "PUT /customer/{id}",
    description: "Update customer",
    request: {
      params: UpdateCustomerParamsSchema,
      query: UpdateCustomerQueryParamesSchema,
      body: {
        content: {
          "application/json": {
            schema: UpdateCustomerRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Customer updated",
        content: {
          "application/json": {
            schema: UpdateCustomerResponseSchema,
          },
        },
      },
      400: {
        description: "Validation errors",
        content: {
          "application/json": {
            schema: ValidationErrorsSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/openapi.yaml",
    summary: "GET /openapi.yaml",
    description: "OpenAPI specification in YAML format",
    responses: {
      200: {
        description: "OpenAPI specification",
        content: {
          "text/yaml": {
            schema: z.string(),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/openapi.json",
    summary: "GET /openapi.json",
    description: "OpenAPI specification in JSON format",
    responses: {
      200: {
        description: "OpenAPI specification",
        content: {
          "application/json": {
            schema: z.string(),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/docs",
    summary: "GET /docs",
    description: "UI for OpenAPI schema",
    responses: {
      200: {
        description: "UI for OpenAPI schema",
        content: {
          "application/json": {
            schema: z.string(),
          },
        },
      },
    },
  });

  return registry;
}

export function createOpenApiSchema(
  servers: { url: string; description: string }[],
  apiGatewayType: "http" | "rest"
) {
  const openApiRegistry = createOpenApiRegistry(apiGatewayType);
  const generator = new OpenApiGeneratorV31(openApiRegistry.definitions);

  const openApiDocs = generator.generateDocument({
    openapi: "3.0.3",
    info: {
      version: "1.0.0",
      title: "Customer API",
    },
    servers: servers,
  });
  return openApiDocs;
}
