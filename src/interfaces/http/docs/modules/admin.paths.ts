export const adminPaths = {
  "/api/v1/admin/dashboard/summary": {
    "get": {
      "tags": [
        "Admin"
      ],
      "summary": "Dashboard summary counts",
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
  "/api/v1/admin/dashboard/recent-orders": {
    "get": {
      "tags": [
        "Admin"
      ],
      "summary": "Recent orders",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "name": "limit",
          "in": "query",
          "schema": {
            "type": "integer"
          }
        }
      ],
      "responses": {
        "200": {
          "description": "OK"
        }
      }
    }
  },
  "/api/v1/admin/dashboard/low-stock": {
    "get": {
      "tags": [
        "Admin"
      ],
      "summary": "Low-stock books",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "name": "threshold",
          "in": "query",
          "schema": {
            "type": "integer",
            "default": 5
          }
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
