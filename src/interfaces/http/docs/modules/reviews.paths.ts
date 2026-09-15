export const reviewsPaths = {
  "/api/v1/reviews": {
    "get": {
      "tags": [
        "Reviews"
      ],
      "summary": "List reviews",
      "responses": {
        "200": {
          "description": "OK"
        }
      }
    },
    "post": {
      "tags": [
        "Reviews"
      ],
      "summary": "Create review",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "responses": {
        "201": {
          "description": "Created"
        }
      }
    }
  }
} as const;
