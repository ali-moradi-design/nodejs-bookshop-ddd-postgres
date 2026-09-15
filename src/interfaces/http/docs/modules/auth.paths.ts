export const authPaths = {
  "/api/v1/auth/register": {
    "post": {
      "tags": [
        "Auth"
      ],
      "summary": "Register (customer role)",
      "description": "Returns tokens in JSON and sets httpOnly `accessToken` / `refreshToken` cookies. Browser clients should call with `credentials: 'include'`.",
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
          "description": "Created. JSON body still includes accessToken and refreshToken (backward compatible). Cookies are also set."
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
      "description": "Returns tokens in JSON and sets httpOnly `accessToken` / `refreshToken` cookies. Browser clients should call with `credentials: 'include'`.",
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
          "description": "OK. JSON body still includes accessToken and refreshToken. Cookies are also set."
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
      "description": "Accepts `refreshToken` from JSON body or the `refreshToken` httpOnly cookie. Rotates tokens, returns them in JSON, and resets cookies.",
      "requestBody": {
        "required": false,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "refreshToken": {
                  "type": "string"
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "OK. New token pair in JSON and cookies."
        },
        "401": {
          "description": "Missing or invalid refresh token"
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
      "description": "Revokes the refresh token from JSON body or the `refreshToken` cookie, then clears both auth cookies.",
      "requestBody": {
        "required": false,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "refreshToken": {
                  "type": "string"
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "OK. Auth cookies cleared."
        }
      }
    }
  }
} as const;
