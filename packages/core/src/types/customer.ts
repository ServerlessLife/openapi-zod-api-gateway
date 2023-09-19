import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const Customer = z.object({
  id: z.string().uuid().openapi({
    description: "The customer's id",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  name: z
    .string()
    .openapi({ description: "The customer's name", example: "John" }),
  surname: z
    .string()
    .openapi({ description: "The customer's surname", example: "Doe" }),
  email: z
    .string()
    .email()
    .openapi({ description: "The customer's email", example: "john@doe.com" }),
});

export type Customer = z.infer<typeof Customer>;

// export const Customer = z.object({
//   id: z.string().uuid(),
//   name: z.string(),
//   surname: z.string(),
//   email: z.string().email(),
// });

// export type Customer = z.infer<typeof Customer>;

// the same as:
// export type Customer = {
//   id: string;
//   name: string;
//   surname: string;
//   email: string;
// };

// to validate the data:
// const validationResult = Customer.safeParse({
//   id: "123e4567-e89b-12d3-a456-426614174000",
//   name: "John",
// });
