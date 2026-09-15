export const reportsPaths = {
  "/api/v1/reports/issues": {
    "get": {
      "tags": [
        "Reports"
      ],
      "summary": "List issue reports",
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
        "Reports"
      ],
      "summary": "Create issue report",
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
  },
  "/api/v1/reports/analytics/revenue": {
    "get": {
      "tags": [
        "Reports"
      ],
      "summary": "Revenue summary",
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
