export const rbacPaths = {
  "/api/v1/permissions": {
    "get": {
      "tags": [
        "RBAC"
      ],
      "summary": "List permissions",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "responses": {
        "200": {
          "description": "OK"
        }
      }
    }
  },
  "/api/v1/roles": {
    "get": {
      "tags": [
        "RBAC"
      ],
      "summary": "List roles",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "responses": {
        "200": {
          "description": "OK"
        }
      }
    }
  }
} as const;
