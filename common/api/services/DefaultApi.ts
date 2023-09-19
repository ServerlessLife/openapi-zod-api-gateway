/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateCustomerRequest } from '../models/UpdateCustomerRequest';
import type { UpdateCustomerResponse } from '../models/UpdateCustomerResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class DefaultApi {

  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * PUT /customer/{id}
   * Update customer
   * @param id
   * @param source
   * @param requestBody
   * @returns UpdateCustomerResponse Customer updated
   * @throws ApiError
   */
  public putCustomer(
    id: string,
    source: 'web' | 'android' | 'ios',
    requestBody?: UpdateCustomerRequest,
  ): CancelablePromise<UpdateCustomerResponse> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/customer/{id}',
      path: {
        'id': id,
      },
      query: {
        'source': source,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Validation errors`,
      },
    });
  }

  /**
   * GET /openapi.yaml
   * OpenAPI specification in YAML format
   * @returns string OpenAPI specification
   * @throws ApiError
   */
  public getOpenapiYaml(): CancelablePromise<string> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/openapi.yaml',
    });
  }

  /**
   * GET /openapi.json
   * OpenAPI specification in JSON format
   * @returns string OpenAPI specification
   * @throws ApiError
   */
  public getOpenapiJson(): CancelablePromise<string> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/openapi.json',
    });
  }

  /**
   * GET /docs
   * UI for OpenAPI schema
   * @returns string UI for OpenAPI schema
   * @throws ApiError
   */
  public getDocs(): CancelablePromise<string> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/docs',
    });
  }

}
