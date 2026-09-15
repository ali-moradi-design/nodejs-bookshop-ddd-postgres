export const discountsPaths = {
  "/api/v1/discounts": {
    "get": {
      "tags": [
        "Discounts"
      ],
      "summary": "List discounts (admin)",
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
        "Discounts"
      ],
      "summary": "Create discount",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "requestBody": {
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/Discount"
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
  "/api/v1/discounts/{id}": {
    "get": {
      "tags": [
        "Discounts"
      ],
      "summary": "Get discount",
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
    "patch": {
      "tags": [
        "Discounts"
      ],
      "summary": "Update discount",
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
        "Discounts"
      ],
      "summary": "Soft-delete discount",
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
