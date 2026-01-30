// Shared types across the application
export type McpToolResponse = {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
};
