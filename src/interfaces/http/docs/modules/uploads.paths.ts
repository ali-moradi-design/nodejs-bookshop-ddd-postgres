export const uploadsPaths = {
  "/api/v1/uploads/book-cover": {
    "post": {
      "tags": [
        "Uploads"
      ],
      "summary": "Upload book cover image (multipart field: file)",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "requestBody": {
        "content": {
          "multipart/form-data": {
            "schema": {
              "type": "object",
              "properties": {
                "file": {
                  "type": "string",
                  "format": "binary"
                }
              }
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Uploaded",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "url": {
                    "type": "string",
                    "example": "/uploads/books/123-cover.jpg"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
} as const;
