import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const ValidationErrorsRest = z.object({
  message: z.string().openapi({ example: "Required" }),
});

export type ValidationErrorsRest = z.infer<typeof ValidationErrorsRest>;
