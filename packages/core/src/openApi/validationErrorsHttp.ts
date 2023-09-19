import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const ValidationErrorsHttp = z.array(
  z.object({
    path: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .openapi({ example: ["name"] }),
    message: z.string().openapi({ example: "Required" }),
  })
);

export type ValidationErrorsHttp = z.infer<typeof ValidationErrorsHttp>;
