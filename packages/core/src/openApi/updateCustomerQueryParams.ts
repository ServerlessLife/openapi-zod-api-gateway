import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const UpdateCustomerQueryParams = z.object({
  source: z.enum(["web", "android", "ios"]).openapi({
    description: "The source of the request",
    example: "web",
  }),
});

export type UpdateCustomerQueryParams = z.infer<
  typeof UpdateCustomerQueryParams
>;
