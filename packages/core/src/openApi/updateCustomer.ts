import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Customer } from "../types/customer";

extendZodWithOpenApi(z);

export const UpdateCustomer = Customer.omit({
  id: true,
});

export type UpdateCustomer = z.infer<typeof UpdateCustomer>;
