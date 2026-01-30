# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is an MCP (Model Context Protocol) server that executes HTTP requests (curl) and waits for asynchronous webhook responses. It's designed for end-to-end testing of async APIs where:
1. An HTTP request triggers a process
2. The external system processes asynchronously
3. The system sends a webhook when complete
4. The MCP captures the webhook and returns the complete result

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Build TypeScript to JavaScript
pnpm run build

# Watch mode (auto-rebuild on changes)
pnpm run watch

# Development mode - MCP Server (stdio)
pnpm run dev:mcp

# Development mode - HTTP Webhook Server
pnpm run dev:http

# Production - Start MCP Server (stdio)
pnpm run start:mcp

# Production - Start HTTP Webhook Server (runs independently)
pnpm run start:http
```

**Important**: The HTTP webhook server (`main-http.ts`) must run as a separate, independent process to receive webhooks. The MCP server (`main.ts`) is invoked on-demand by Claude Desktop and does NOT start the HTTP server.

## Running the Servers

### Two-Server Architecture

This project has two separate entry points that run as independent processes:

1. **HTTP Webhook Server** (`main-http.ts`) - Must be running continuously
   - Receives webhook callbacks from external systems
   - Runs on port 3456 (configurable via `WEBHOOK_PORT`)
   - Start with: `pnpm run start:http` or `pnpm run dev:http`

2. **MCP Server** (`main.ts`) - Invoked on-demand by Claude Desktop
   - Provides MCP tools to Claude Desktop
   - Communicates via stdio (not HTTP)
   - Started automatically when Claude uses the tools
   - Does NOT start the HTTP server

### Typical Workflow

1. **Start the HTTP server first** (keep it running):
   ```bash
   pnpm run dev:http
   # or in production:
   pnpm run start:http
   ```

2. **Configure Claude Desktop** to use the MCP server (in `claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "compara-test-tools": {
         "command": "node",
         "args": ["/path/to/mcp-compara-test-tools/dist/main.js"],
         "env": {
           "WEBHOOK_PORT": "3456",
           "WEBHOOK_BASE_URL": "http://localhost:3456",
           "DB_PATH": "./webhook-tests.db"
         }
       }
     }
   }
   ```

3. **Use the MCP tools** in Claude Desktop - the MCP server starts automatically

Both servers share the same SQLite database for coordination.

## Architecture

The codebase follows **Clean Architecture** principles with clear separation of concerns:

### Clean Architecture Layers

```
┌─────────────────────┐          ┌─────────────────────────┐
│    main.ts          │          │    main-http.ts         │
│  (MCP Entry Point)  │          │  (HTTP Entry Point)     │
│  Started on-demand  │          │  Runs independently     │
└─────────────────────┘          └─────────────────────────┘
          │                                  │
          ▼                                  ▼
    ┌──────────────┐                ┌──────────────┐
    │ Presentation │                │ Presentation │
    │ (MCP Server) │                │ (HTTP Server)│
    └──────────────┘                └──────────────┘
          │                                  │
          └──────────────┬───────────────────┘
                         ▼
                ┌──────────────┐
                │ Application  │
                │ (Use Cases)  │
                └──────────────┘
                         │
                ┌────────┴────────┐
                ▼                 ▼
        ┌──────────────┐  ┌──────────────┐
        │ Domain       │  │ Infrastructure│
        │ (Entities &  │  │ (Database,    │
        │  Interfaces) │  │  HTTP, Config)│
        └──────────────┘  └──────────────┘
```

### Folder Structure

```
src/
├── domain/                      # Enterprise Business Rules
│   ├── entities/               # Pure entities (WebhookTest, HttpRequest, HttpResponse)
│   ├── repositories/           # Repository interfaces
│   └── services/               # Service interfaces
│
├── application/                # Application Business Rules
│   ├── use-cases/             # 6 use cases (one per MCP tool)
│   ├── dto/                   # Data Transfer Objects
│   └── interfaces/            # Logger interface
│
├── infrastructure/            # Frameworks & Drivers
│   ├── database/              # SQLite implementation
│   ├── http/                  # HTTP executor & curl parser
│   ├── config/                # Configuration management
│   └── logger/                # Console logger
│
├── presentation/              # Interface Adapters
│   ├── mcp/                   # MCP server (stdio)
│   │   ├── tools/            # Tool definitions & handlers
│   │   └── adapters/         # MCP adapters
│   └── http/                  # Express server (HTTP)
│       └── routes/           # Webhook & health routes
│
├── shared/                    # Shared utilities
│   ├── types/
│   ├── errors/
│   └── utils/
│
├── main.ts                    # MCP server entry point (stdio)
└── main-http.ts               # HTTP server entry point (webhook receiver)
```

### Key Components

**Domain Layer (No dependencies)**:
- `WebhookTest` entity with status tracking
- `HttpRequest` entity with placeholder replacement
- `HttpResponse` entity with status helpers
- Repository and service interfaces

**Application Layer (Depends on domain interfaces)**:
- `ExecuteCurlAndWaitWebhook` - Main async testing use case
- `ExecuteHttpRequest` - Synchronous HTTP execution
- `GetWebhookUrl` - Generate webhook URLs
- `WaitForWebhook` - Wait for manual webhook
- `GetTestResults` - Retrieve test history
- `ClearTestResults` - Clear test history

**Infrastructure Layer (Implements domain interfaces)**:
- `SqliteTestRepository` - Database operations with polling
- `FetchHttpExecutor` - HTTP execution via fetch
- `CurlParser` - Parses curl commands
- `Config` - Environment variable management
- `ConsoleLogger` - Logging implementation

**Presentation Layer (Adapts external protocols)**:
- **MCP Server** (`McpServer.ts`) - Handles MCP protocol via stdio
- **Express Server** (`ExpressServer.ts`) - Handles webhooks via HTTP
- Tool handlers and adapters

### Design Principles

1. **Dependency Inversion**: All layers depend on abstractions (interfaces)
2. **Separation of Concerns**: MCP server and Express server are completely separate
3. **Single Responsibility**: Each class has one clear purpose
4. **Clean Dependencies**: Dependencies flow inward (domain has no dependencies)

### Core Flow

**executeCurlAndWaitWebhook Use Case**:
1. Parse curl command OR structured HTTP params → `HttpRequest` entity
2. Replace `{{WEBHOOK_URL}}` placeholder with webhook endpoint
3. Execute HTTP request via `IHttpExecutor`
4. Create pending test record in `ITestRepository`
5. Poll database every 200ms waiting for webhook arrival
6. Express endpoint writes webhook payload to database
7. Polling detects completion and returns result

### Communication Between Servers

Both servers (MCP and Express) communicate via **shared SQLite database**:

```
┌────────────────┐
│  MCP Server    │ (stdio transport, managed by Claude Desktop)
│  (McpServer)   │
└───────┬────────┘
        │ reads/writes
        ▼
┌────────────────────┐     ┌──────────────────┐
│  SQLite Database   │◄────┤ Express Server   │
│ (webhook-tests.db) │     │ (HTTP port 3456) │
└────────────────────┘     └──────────────────┘
        ▲                           ▲
        │ polls (200ms)             │ writes on webhook arrival
        └───────────────────────────┘
```

**Key Points**:
- **Two separate processes**: MCP server (on-demand) and HTTP server (always running)
- No direct inter-process communication needed
- Database polling for async coordination
- HTTP server must be started independently and kept running
- MCP server is invoked by Claude Desktop when tools are used
- Both servers share the same SQLite database for coordination

## Environment Configuration

Required env vars (configure in Claude Desktop config or .mcp.json):
- `WEBHOOK_PORT`: Port for webhook server (default: 3456)
- `WEBHOOK_BASE_URL`: Public URL for webhooks (default: http://localhost:3456)
- `DB_PATH`: SQLite database path (default: ./webhook-tests.db)

For external APIs to reach local machine, use ngrok:
```bash
ngrok http 3456
# Then set WEBHOOK_BASE_URL=https://your-id.ngrok.io
```

## MCP Tools Available

### Primary Tool: `executeCurlAndWaitWebhook`
The main tool for async testing. Accepts either:
- `curlCommand`: Full curl string (parses -X, -H, -d flags)
- OR `url` + `method` + `headers` + `body` (structured params)

Parameters:
- `testId`: **REQUIRED** - Test ID for the webhook URL. Use descriptive IDs like `test-payment-001` or `webhook-checkout-flow`
- `webhookUrlPlaceholder`: String to replace (default: `{{WEBHOOK_URL}}`)
- `timeoutSeconds`: Max wait time for webhook (default: 300)

### Other Tools:
- `executeHttpRequest`: Execute HTTP without waiting for webhook (immediate response)
- `getWebhookUrl`: Generate webhook URL for manual testing
- `waitForWebhook`: Wait for webhook from manual testing flow
- `getTestResults`: Get session test history
- `clearTestResults`: Clear test history

## TypeScript Configuration

- Target: ES2022
- Module: Node16 (ESM with .js extensions in imports)
- Output: `dist/` directory
- Source maps and declarations enabled

## Testing the Server Directly

Use `example-test.sh` to test webhook server without Claude:
```bash
./example-test.sh
```

This script:
1. Checks `/health` endpoint
2. Gets webhook URL for a test ID
3. Simulates webhook POST after 2 seconds
4. Verifies webhook received

## Common Patterns

**Two Testing Workflows**:

1. **Dynamic webhook URL** (API accepts webhook URL in request):
   - Provide descriptive `testId`: `"test-payment-001"`
   - Use `{{WEBHOOK_URL}}` placeholder in request body
   - Tool generates webhook URL and replaces placeholder
   - Example: `{testId: "test-checkout", body: {"callbackUrl": "{{WEBHOOK_URL}}"}}`

2. **Pre-configured webhook URL** (webhook URL configured beforehand):
   - Provide known `testId`: `"webhook-prod-sync"`
   - Configure external system with: `${WEBHOOK_BASE_URL}/webhook/webhook-prod-sync`
   - Call tool with same `testId`
   - Tool waits for callback to that specific URL

**Placeholder Replacement**:
The system searches for `webhookUrlPlaceholder` in request body and URL, replacing with actual webhook endpoint. JSON bodies are parsed, replaced, and re-serialized.

**Blocking Behavior**:
`executeCurlAndWaitWebhook` BLOCKS until webhook arrives or timeout expires. This enables synchronous-style testing of async APIs.

**Error Handling**:
All tool implementations catch errors and return structured responses with `isError: true` flag. Test results track both successful and failed tests.

**Logging**:
All console output goes to `stderr` (MCP protocol requirement). Logs include test lifecycle events, HTTP execution, and webhook reception.

## Layer Responsibilities

### Domain Layer
- **No external dependencies**
- Pure business entities and interfaces
- No framework code
- Examples: `WebhookTest`, `HttpRequest`, `ITestRepository`

### Application Layer
- **Depends only on domain interfaces**
- Contains use case business logic
- Framework-agnostic
- Examples: `ExecuteCurlAndWaitWebhook`, DTOs

### Infrastructure Layer
- **Implements domain interfaces**
- Contains technical details (database, HTTP, config)
- Framework-specific code
- Examples: `SqliteTestRepository`, `FetchHttpExecutor`

### Presentation Layer
- **Adapts external protocols to use cases**
- Separated servers: MCP (stdio) and Express (HTTP)
- Protocol-specific code
- Examples: `McpServer`, `ExpressServer`

## Development Tips

- **Adding a new tool**: Create use case in `application/`, add to `ToolHandlers`, add definition to `ToolDefinitions`
- **Changing database**: Implement `ITestRepository` interface with new database
- **Changing HTTP client**: Implement `IHttpExecutor` interface with new client
- **Testing layers**: Each layer can be unit tested in isolation by mocking interfaces
