export const authPaths = {
  "/api/v1/auth/register": {
    "post": {
      "tags": [
        "Auth"
      ],
      "summary": "Register (customer role)",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/RegisterRequest"
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Created"
        },
        "409": {
          "description": "Conflict"
        }
      }
    }
  },
  "/api/v1/auth/login": {
    "post": {
      "tags": [
        "Auth"
      ],
      "summary": "Login",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/LoginRequest"
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "OK"
        },
        "401": {
          "description": "Unauthorized"
        }
      }
    }
  },
  "/api/v1/auth/refresh": {
    "post": {
      "tags": [
        "Auth"
      ],
      "summary": "Rotate refresh token",
      "responses": {
        "200": {
          "description": "OK"
        }
      }
    }
  },
  "/api/v1/auth/logout": {
    "post": {
      "tags": [
        "Auth"
      ],
      "summary": "Revoke refresh token",
      "responses": {
        "200": {
          "description": "OK"
        }
      }
    }
  }
} as const;
