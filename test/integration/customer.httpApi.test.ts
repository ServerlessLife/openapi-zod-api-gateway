import { describe, expect, test } from "vitest";
import { Api, UpdateCustomerRequest } from "@common/api";
import { Config } from "sst/node/config";

describe("customer endpoint", () => {
  const apiClient = new Api({
    BASE: Config.HTTP_API,
  }).default;

  test("update customer - valid", async () => {
    const customerId = "d290f1ee-6c54-4b01-90e6-d701748f0851";
    const customer: UpdateCustomerRequest = {
      name: "John",
      surname: "Doe",
      email: "john@doe.com",
    };

    const response = await apiClient.putCustomer(customerId, "web", customer);

    expect(response).toEqual({
      id: customerId,
      ...customer,
    });
  });

  test("update customer - invalid schema", async () => {
    const customerId = "d290f1ee-6c54-4b01-90e6-d701748f0851";
    const customer = {
      name: "John",
      email: "john@doe.com",
    };

    await expect(
      apiClient.putCustomer(customerId, "web", customer as any)
    ).rejects.toMatchObject({
      body: [
        {
          path: ["surname"],
          message: "Required",
        },
      ],
    });
  });
});
