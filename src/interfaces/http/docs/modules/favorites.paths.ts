export const favoritesPaths = {
  "/api/v1/favorites": {
    "get": {
      "tags": [
        "Favorites"
      ],
      "summary": "List favorites",
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
    },
    "post": {
      "tags": [
        "Favorites"
      ],
      "summary": "Add favorite",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "requestBody": {
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": [
                "bookId"
              ],
              "properties": {
                "bookId": {
                  "type": "string"
                }
              }
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Created"
        }
      }
    }
  },
  "/api/v1/favorites/{bookId}": {
    "delete": {
      "tags": [
        "Favorites"
      ],
      "summary": "Remove favorite",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "name": "bookId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string"
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
