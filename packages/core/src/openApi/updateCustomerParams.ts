import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Customer } from "../types/customer";

extendZodWithOpenApi(z);

export const UpdateCustomerParams = Customer.pick({
  id: true,
});

export type UpdateCustomerParams = z.infer<typeof UpdateCustomerParams>;
