export const booksPaths = {
  "/api/v1/books": {
    "get": {
      "tags": [
        "Books"
      ],
      "summary": "List/search books",
      "description": "Search uses case-insensitive regex on title/author/description (text index also defined for future $text). Query: q, category, minPrice, maxPrice, inStock, featured, page, limit, sort (price|title|createdAt), order (asc|desc).",
      "parameters": [
        {
          "name": "q",
          "in": "query",
          "schema": {
            "type": "string"
          }
        },
        {
          "name": "category",
          "in": "query",
          "schema": {
            "type": "string"
          }
        },
        {
          "name": "minPrice",
          "in": "query",
          "schema": {
            "type": "number"
          }
        },
        {
          "name": "maxPrice",
          "in": "query",
          "schema": {
            "type": "number"
          }
        },
        {
          "name": "inStock",
          "in": "query",
          "schema": {
            "type": "boolean"
          }
        },
        {
          "name": "featured",
          "in": "query",
          "schema": {
            "type": "boolean"
          }
        },
        {
          "name": "page",
          "in": "query",
          "schema": {
            "type": "integer"
          }
        },
        {
          "name": "limit",
          "in": "query",
          "schema": {
            "type": "integer"
          }
        },
        {
          "name": "sort",
          "in": "query",
          "schema": {
            "type": "string",
            "enum": [
              "price",
              "title",
              "createdAt"
            ]
          }
        },
        {
          "name": "order",
          "in": "query",
          "schema": {
            "type": "string",
            "enum": [
              "asc",
              "desc"
            ]
          }
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
        "Books"
      ],
      "summary": "Create book",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "requestBody": {
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/Book"
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
  "/api/v1/books/featured": {
    "get": {
      "tags": [
        "Books"
      ],
      "summary": "List featured books",
      "responses": {
        "200": {
          "description": "OK"
        }
      }
    }
  },
  "/api/v1/books/{id}": {
    "get": {
      "tags": [
        "Books"
      ],
      "summary": "Get book",
      "parameters": [
        {
          "name": "id",
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
    },
    "patch": {
      "tags": [
        "Books"
      ],
      "summary": "Update book (incl. featured flags)",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "name": "id",
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
    },
    "delete": {
      "tags": [
        "Books"
      ],
      "summary": "Soft-delete book",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "name": "id",
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
