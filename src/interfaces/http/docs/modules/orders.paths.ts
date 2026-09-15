export const ordersPaths = {
  "/api/v1/orders": {
    "get": {
      "tags": [
        "Orders"
      ],
      "summary": "List orders (own or all)",
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
        "Orders"
      ],
      "summary": "Create order (optional discountCode)",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "requestBody": {
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/CreateOrder"
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
  "/api/v1/orders/{id}/pay": {
    "post": {
      "tags": [
        "Orders"
      ],
      "summary": "Fake payment + atomic stock decrement",
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
          "description": "Paid"
        },
        "409": {
          "description": "Insufficient stock"
        }
      }
    }
  },
  "/api/v1/orders/{id}/status": {
    "patch": {
      "tags": [
        "Orders"
      ],
      "summary": "Update order status",
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
