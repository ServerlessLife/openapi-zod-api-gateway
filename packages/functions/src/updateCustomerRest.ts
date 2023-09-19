import { openApiLambdaRestHandler } from "./util/openApiLambdaRestHandler";
import { UpdateCustomer } from "@openapi-zod-api-gateway/core/src/openApi/updateCustomer";
import { UpdateCustomerParams } from "@openapi-zod-api-gateway/core/src/openApi/updateCustomerParams";
import { UpdateCustomerQueryParams } from "@openapi-zod-api-gateway/core/src/openApi/updateCustomerQueryParams";

export const handler = openApiLambdaRestHandler<
  UpdateCustomer,
  UpdateCustomerParams,
  UpdateCustomerQueryParams
>(async (request) => {
  const customer = {
    id: request.pathParameters.id, // pathParameters is type of UpdateCustomerParams
    ...request.body, // body is type of UpdateCustomer
  };

  console.log("Customer updated", customer);
  console.log(
    "Source",
    request.queryParameters.source // queryParameters is type of UpdateCustomerQueryParams
  );

  return {
    statusCode: 200,
    body: customer,
    headers: {
      "Content-Type": "application/json",
    },
  };
});
