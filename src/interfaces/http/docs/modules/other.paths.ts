export const otherPaths = {
  "/api/health": {
    "get": {
      "tags": [
        "Health"
      ],
      "summary": "Health check (unversioned)",
      "responses": {
        "200": {
          "description": "OK"
        }
      }
    }
  }
} as const;
