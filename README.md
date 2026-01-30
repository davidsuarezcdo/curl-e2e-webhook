# Curl + Webhook Tester MCP

MCP server para ejecutar peticiones HTTP/curl y esperar respuestas por webhook. Perfecto para testing e2e de APIs asíncronas.

**Versión 4.0**: Refactorizado con Clean Architecture para mejor mantenibilidad y separación de responsabilidades.

## Concepto

**Acción por Curl → Reacción por Webhook**

Este MCP permite probar integraciones asíncronas donde:
1. Ejecutas una petición HTTP (curl) que inicia un proceso
2. El sistema procesa en background
3. El sistema envía un webhook cuando termina
4. El MCP captura el webhook y retorna el resultado completo

## Características

- **Ejecuta cualquier comando curl**: Acepta comandos curl estándar o peticiones HTTP estructuradas
- **Espera bloqueante de webhooks**: Espera respuestas asíncronas vía webhook
- **Testing automatizado**: Perfecto para flujos e2e donde necesitas verificar ciclos completos
- **Servidor de webhooks integrado**: No necesitas configurar infraestructura adicional
- **Historial de pruebas**: Mantiene registro de todas las pruebas ejecutadas
- **100% genérico**: Funciona con cualquier API

## Instalación

```bash
cd /home/david/compara/repos/mcp-compara-test-tools
pnpm install
pnpm run build
```

## Configuración en Claude Desktop

Agrega esto a tu `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "curl-webhook-tester": {
      "command": "node",
      "args": ["/home/david/compara/repos/mcp-compara-test-tools/dist/main.js"],
      "env": {
        "WEBHOOK_PORT": "3456",
        "WEBHOOK_BASE_URL": "http://localhost:3456"
      }
    }
  }
}
```

### Si usas un túnel (ngrok, localtunnel, etc.)

Para que servicios externos puedan enviar webhooks a tu máquina local:

```bash
# Con ngrok
ngrok http 3456

# Luego actualiza WEBHOOK_BASE_URL:
{
  "mcpServers": {
    "curl-webhook-tester": {
      "command": "node",
      "args": ["/home/david/compara/repos/mcp-compara-test-tools/dist/main.js"],
      "env": {
        "WEBHOOK_PORT": "3456",
        "WEBHOOK_BASE_URL": "https://tu-id.ngrok.io"
      }
    }
  }
}
```

## Herramientas Disponibles

### 1. `executeCurlAndWaitWebhook` ⭐ PRINCIPAL

Ejecuta un comando curl o petición HTTP y espera un webhook de respuesta.

**Casos de uso:**
- APIs de procesamiento de pagos (Stripe, PayPal, etc.)
- Sistemas de notificaciones asíncronas
- Workflows de integración
- Cualquier API que responde vía webhook

**Ejemplo con comando curl:**

```
"Ejecuta este curl y espera el webhook:
curl -X POST https://api.example.com/process
-H 'Content-Type: application/json'
-d '{\"webhookUrl\": \"{{WEBHOOK_URL}}\", \"data\": \"test\"}'"
```

**Ejemplo con parámetros estructurados:**

```
"Haz un POST a https://api.example.com/process
con body {\"callback\": \"{{WEBHOOK_URL}}\", \"amount\": 100}
y espera el webhook"
```

**Parámetros:**
- `testId`: **REQUERIDO** - ID del test para la URL del webhook. Usa IDs descriptivos como `test-payment-001`
- `curlCommand`: Comando curl completo
- `url`: URL del endpoint (alternativa)
- `method`: GET, POST, PUT, DELETE, etc.
- `headers`: Headers HTTP
- `body`: Cuerpo de la petición
- `timeoutSeconds`: Timeout para esperar webhook (default: 300)
- `webhookUrlPlaceholder`: Placeholder a reemplazar (default: `{{WEBHOOK_URL}}`)

### 2. `executeHttpRequest`

Ejecuta una petición HTTP sin esperar webhook. Para requests con respuesta inmediata.

**Ejemplo:**

```
"Ejecuta: curl -X GET https://api.example.com/status"
```

**Parámetros:**
- `curlCommand`: Comando curl completo
- `url`: URL del endpoint (alternativa)
- `method`: GET, POST, PUT, DELETE, etc.
- `headers`: Headers HTTP
- `body`: Cuerpo de la petición

### 3. `getWebhookUrl`

Genera una URL de webhook única para testing manual.

**Flujo:**
1. Llama `getWebhookUrl` → obtienes testId y webhookUrl
2. Ejecuta tu request HTTP manualmente usando la webhookUrl
3. Llama `waitForWebhook` con el testId
4. Recibes el payload del webhook

### 4. `waitForWebhook`

Espera un webhook para un testId previamente generado con `getWebhookUrl`.

### 5. `getTestResults`

Obtiene el historial de pruebas ejecutadas en la sesión actual.

### 6. `clearTestResults`

Limpia el historial de pruebas.

## Ejemplos de Uso

### Ejemplo 1: API de Pagos

```
Usuario: "Necesito probar el endpoint de procesamiento de pagos.
         Cuando envío un POST a https://api.payments.com/charge,
         el sistema procesa el pago y envía un webhook con el resultado."

Claude: [Usa executeCurlAndWaitWebhook]

✓ Petición HTTP enviada
✓ Response: { "status": "processing", "chargeId": "ch_123" }
✓ Esperando webhook...
✓ Webhook recibido!

Resultados:
- Test ID: test-payment-001
- Duración: 2.8 segundos
- HTTP Response: { "status": "processing", "chargeId": "ch_123" }
- Webhook Response: {
    "status": "succeeded",
    "chargeId": "ch_123",
    "amount": 100,
    "currency": "usd"
  }

El test fue exitoso. El pago se procesó correctamente.
```

### Ejemplo 2: Integración con Webhook Personalizado

```
Usuario: "Ejecuta este curl y espera el webhook:
         curl -X POST https://api.example.com/notify \
         -H 'Authorization: Bearer token123' \
         -H 'Content-Type: application/json' \
         -d '{\"callback\": \"{{WEBHOOK_URL}}\", \"event\": \"test\"}'"

Claude: [Parsea el curl y ejecuta]

✓ Comando curl parseado
✓ URL del webhook inyectada: http://localhost:3456/webhook/xyz-789
✓ Petición ejecutada con status 200
✓ Webhook recibido en 1.5 segundos

HTTP Response: { "status": "queued", "jobId": "job-456" }
Webhook payload: { "jobId": "job-456", "status": "completed", "result": {...} }
```

### Ejemplo 3: Testing Manual con getWebhookUrl

```
Usuario: "Dame una URL de webhook para testing manual"

Claude: [Usa getWebhookUrl]

{
  "testId": "manual-xyz",
  "webhookUrl": "http://localhost:3456/webhook/manual-xyz",
  "instructions": [
    "Use this webhook URL as callback in your HTTP request",
    "Then call waitForWebhook with testId: manual-xyz"
  ]
}

Usuario: "Espera el webhook para manual-xyz"

Claude: [Usa waitForWebhook]

✓ Esperando webhook...
✓ Webhook recibido en 45 segundos

{
  "testId": "manual-xyz",
  "duration": 45123,
  "webhookResponse": { ... }
}
```

## Arquitectura

### Clean Architecture (v4.0)

El proyecto sigue principios de Clean Architecture con 4 capas claramente separadas:

```
┌─────────────────────────────────────────────────┐
│              main.ts (Entry Point)              │
│          Dependency Injection Root              │
└─────────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Presentation │ │ Presentation │ │   Shared     │
│ (MCP Server) │ │(HTTP Server) │ │  Utilities   │
│   stdio      │ │  port 3456   │ └──────────────┘
└──────────────┘ └──────────────┘
        │              │
        └──────┬───────┘
               ▼
     ┌──────────────┐
     │ Application  │    ← 6 Use Cases (lógica de negocio)
     │ (Use Cases)  │
     └──────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
┌──────────────┐ ┌──────────────┐
│   Domain     │ │Infrastructure│
│ (Entities &  │ │  (Database,  │
│  Interfaces) │ │  HTTP, Config│
└──────────────┘ └──────────────┘
```

**Capas**:
- **Domain**: Entidades puras sin dependencias (WebhookTest, HttpRequest, HttpResponse)
- **Application**: Casos de uso (6 use cases, uno por herramienta MCP)
- **Infrastructure**: Implementaciones técnicas (SQLite, HTTP, config)
- **Presentation**: Adaptadores de protocolos (MCP server + Express server separados)

**Comunicación entre servidores**:
```
MCP Server (stdio) ←─┬─→ SQLite DB ←─┬─→ Express Server (HTTP :3456)
                      │                │
                   Polling           Webhooks
                   (200ms)          (escritura)
```

Ambos servidores comparten base de datos SQLite para coordinación asíncrona.

## Placeholder de Webhook

Por defecto, el sistema busca y reemplaza `{{WEBHOOK_URL}}` en:
- El cuerpo de la petición (body)
- La URL del endpoint

**Ejemplo de transformación:**

```json
// Request original
{
  "url": "https://api.example.com/process",
  "body": {
    "callbackUrl": "{{WEBHOOK_URL}}",
    "data": "test"
  }
}

// Request ejecutado
{
  "url": "https://api.example.com/process",
  "body": {
    "callbackUrl": "http://localhost:3456/webhook/abc-123",
    "data": "test"
  }
}
```

Puedes personalizar el placeholder usando `webhookUrlPlaceholder`.

## Formato de Comandos Curl

El parser soporta estos flags:

- `-X` / `--request`: Método HTTP
- `-H` / `--header`: Headers
- `-d` / `--data` / `--data-raw`: Body

**Ejemplo válido:**
```bash
curl -X POST https://api.example.com/endpoint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{"key": "value"}'
```

## Desarrollo

```bash
# Modo desarrollo con hot reload
pnpm run dev

# Build
pnpm run build

# Watch mode
pnpm run watch
```

### Estructura del Código (Clean Architecture)

```
src/
├── domain/          # Entidades puras, sin dependencias
├── application/     # Casos de uso (lógica de negocio)
├── infrastructure/  # Implementaciones (DB, HTTP, config)
├── presentation/    # Servidores (MCP + Express)
├── shared/          # Utilidades compartidas
└── main.ts         # Entry point (dependency injection)
```

## Troubleshooting

### Claude no ve las herramientas

1. Verifica que el servidor MCP esté corriendo
2. Reinicia Claude Desktop
3. Verifica `claude_desktop_config.json`

### Los webhooks no llegan

1. Verifica que la API externa pueda alcanzar tu URL (usa ngrok si estás en localhost)
2. Chequea que el puerto 3456 esté libre
3. Verifica los logs del servidor (`stderr`)
4. Prueba el endpoint manualmente:
   ```bash
   curl -X POST http://localhost:3456/webhook/test-123 \
     -d '{"test": "data"}' \
     -H "Content-Type: application/json"
   ```

### Timeouts

Si los webhooks tardan mucho:
- Aumenta `timeoutSeconds` en la llamada
- Verifica que el servicio externo funcione
- Revisa los logs

### Error parseando curl

Si el parser falla:
- Usa parámetros estructurados (`url`, `method`, `headers`, `body`)
- Verifica que las comillas estén balanceadas
- Reporta el issue con el comando que falló

## Logs

El servidor envía logs a `stderr`:

```
[MCP] Webhook server listening on port 3456
[MCP] Server started successfully
[MCP] Starting HTTP request test abc-123
[MCP] Executing HTTP request: POST https://api.example.com/endpoint
[MCP] HTTP request completed with status 200
[MCP] Waiting for webhook...
[WEBHOOK] ✓ Received webhook for test: abc-123
[MCP] ✓ Test abc-123 completed in 2341ms
```

## Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `WEBHOOK_PORT` | Puerto del servidor HTTP | `3456` |
| `WEBHOOK_BASE_URL` | URL base pública (para ngrok/tunnels) | `http://localhost:3456` |

## Casos de Uso

- ✅ Testing de APIs de procesamiento de pagos
- ✅ Webhooks de servicios de terceros (Stripe, PayPal, Twilio)
- ✅ Workflows asíncronos de cualquier API
- ✅ Testing e2e de flujos de notificaciones
- ✅ Validación de integraciones webhook
- ✅ Pruebas de sistemas de colas y workers
- ✅ Integraciones con ERPs (NetSuite, SAP, etc.)

## Licencia

MIT
