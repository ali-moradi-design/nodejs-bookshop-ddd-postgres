export const cartPaths = {
  "/api/v1/cart": {
    "get": {
      "tags": [
        "Cart"
      ],
      "summary": "Get current user cart",
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
    "delete": {
      "tags": [
        "Cart"
      ],
      "summary": "Clear cart",
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
  "/api/v1/cart/items": {
    "post": {
      "tags": [
        "Cart"
      ],
      "summary": "Add item to cart",
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
                "bookId",
                "quantity"
              ],
              "properties": {
                "bookId": {
                  "type": "string"
                },
                "quantity": {
                  "type": "integer"
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
  "/api/v1/cart/items/{bookId}": {
    "patch": {
      "tags": [
        "Cart"
      ],
      "summary": "Update cart item quantity",
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
    },
    "delete": {
      "tags": [
        "Cart"
      ],
      "summary": "Remove item from cart",
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
  },
  "/api/v1/cart/checkout": {
    "post": {
      "tags": [
        "Cart"
      ],
      "summary": "Checkout cart → pending_payment order; clears cart",
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
                "shippingAddress"
              ],
              "properties": {
                "shippingAddress": {
                  "$ref": "#/components/schemas/ShippingAddress"
                },
                "discountCode": {
                  "type": "string"
                }
              }
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Order created"
        }
      }
    }
  }
} as const;
