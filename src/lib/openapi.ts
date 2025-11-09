/**
 * OpenAPI Specification for Kanvas API
 */
export const openapiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Kanvas API",
    description: "API documentation for Kanvas - A Kanban board application",
    version: "1.0.0",
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      description: "API Server",
    },
  ],
  paths: {
    "/api/workspaces": {
      get: {
        summary: "Get all workspaces",
        description: "Retrieve all workspaces for the authenticated user",
        tags: ["Workspaces"],
        responses: {
          "200": {
            description: "List of workspaces",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    "/api/boards": {
      get: {
        summary: "Get all boards",
        description: "Retrieve all boards for a workspace",
        tags: ["Boards"],
        parameters: [
          {
            name: "workspaceId",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Workspace ID",
          },
        ],
        responses: {
          "200": {
            description: "List of boards",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      workspaceId: { type: "string" },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    "/api/columns": {
      get: {
        summary: "Get all columns",
        description: "Retrieve all columns for a board",
        tags: ["Columns"],
        parameters: [
          {
            name: "boardId",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Board ID",
          },
        ],
        responses: {
          "200": {
            description: "List of columns",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      boardId: { type: "string" },
                      order: { type: "number" },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    "/api/tasks": {
      get: {
        summary: "Get all tasks",
        description: "Retrieve all tasks for a column",
        tags: ["Tasks"],
        parameters: [
          {
            name: "columnId",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Column ID",
          },
        ],
        responses: {
          "200": {
            description: "List of tasks",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string" },
                      description: { type: "string" },
                      columnId: { type: "string" },
                      order: { type: "number" },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
        },
        security: [{ bearerAuth: [] }],
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};
