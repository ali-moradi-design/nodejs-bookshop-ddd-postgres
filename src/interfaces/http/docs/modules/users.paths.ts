export const usersPaths = {
  "/api/v1/users": {
    "get": {
      "tags": [
        "Users"
      ],
      "summary": "List users",
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
  "/api/v1/users/me": {
    "get": {
      "tags": [
        "Users"
      ],
      "summary": "Current user",
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
