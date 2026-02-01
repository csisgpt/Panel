/**
 * Generated via openapi-typescript.
 * Regenerate with `yarn gen:api-types` after updating backend docs/openapi.json.
 */
export interface paths {
  "/files/{id}": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": components["schemas"]["FileMeta"];
          };
        };
      };
    };
  };
  "/files/links/batch": {
    post: {
      requestBody: {
        content: {
          "application/json": {
            fileIds: string[];
            mode?: string;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": {
              data?: components["schemas"]["FileLink"][];
            };
          };
        };
      };
    };
  };
  "/withdrawals": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": components["schemas"]["WithdrawalsList"];
          };
        };
      };
    };
  };
  "/deposits": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": components["schemas"]["DepositsList"];
          };
        };
      };
    };
  };
}

export interface components {
  schemas: {
    ListMeta: {
      page?: number;
      limit?: number;
      total?: number;
    };
    FileMeta: {
      id?: string;
      fileName?: string;
      mimeType?: string;
    };
    FileLink: {
      id?: string;
      previewUrl?: string;
      downloadUrl?: string;
    };
    WithdrawRequest: {
      id?: string;
      amount?: string;
      status?: string;
    };
    DepositRequest: {
      id?: string;
      amount?: string;
      status?: string;
    };
    WithdrawalsList: {
      items?: components["schemas"]["WithdrawRequest"][];
      meta?: components["schemas"]["ListMeta"];
    };
    DepositsList: {
      items?: components["schemas"]["DepositRequest"][];
      meta?: components["schemas"]["ListMeta"];
    };
  };
}
