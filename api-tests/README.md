# Documentación API - Módulo Clientes

## 1. Información general

Frontend: https://imcoarca.leonardojose.dev/

Base URL API: https://back-imcoarca.leonardojose.dev/api

Autenticación: Bearer Token.

Los endpoints protegidos requieren:

- Authorization: ``Bearer {{token}}``
- Accept: ``application/json``

Para requests que envían JSON (POST y PUT) se utiliza además:

- Content-Type: ``application/json``

En Bruno se configuraron las siguientes variables de entorno:

- ``baseUrl``
- ``token``
- ``clienteId``
- ``sellerToken``
- ``sellerClienteId``

``token`` se obtiene dinámicamente mediante el Login Admin y ``sellerToken`` mediante el Login Vendedor. ``clienteId`` y ``sellerClienteId`` se obtienen dinámicamente al crear los clientes utilizados en sus respectivos flujos.

## 2. Autenticación
01 – Login

Objetivo: autenticar un usuario válido y obtener el token utilizado por las siguientes requests.

Método y endpoint:

POST {{baseUrl}}/api/login
Headers
Content-Type: application/json
Accept: application/json
Payload
{
  "email": "tae@testing.com",
  "password": "Tae@2026"
}
Status esperado
200 OK
Respuesta relevante
{
  "access_token": "...",
  "token_type": "Bearer"
}

Post Response Script

El token se almacena automáticamente en el Environment QA:

if (res.status === 200 && res.body?.access_token) {
    bru.setEnvVar("token", res.body.access_token);
    console.log("Token guardado correctamente");
}

## 3. Clientes – Happy Path

El Happy Path valida el ciclo CRUD completo utilizando un mismo cliente:

```
Login
  ↓
Create Cliente
  ↓
Get Cliente
  ↓
Update Cliente
  ↓
Delete Cliente
  ↓
Get Cliente Eliminado
```

02 – Crear Cliente

Objetivo: comprobar que la API permite crear un cliente con datos válidos.

Método y endpoint:

POST {{baseUrl}}/api/clients
Headers
Authorization: Bearer {{token}}
Content-Type: application/json
Accept: application/json
Payload utilizado
{
  "name": "Cliente API Bruno Prueba",
  "cuit": "20-12345678-6",
  "email": "",
  "phone": "",
  "whatsapp": "",
  "cbu": null,
  "collection_contact": "",
  "collection_email": "",
  "collection_phone": "",
  "collection_portal_password": "",
  "collection_portal_url": "",
  "collection_portal_username": "",
  "estado": "Activo",
  "serie": "",
  "startdate": "2026-09-02",
  "tax": "",
  "taxes": [],
  "zone": null,
  "zone_name": null
}
Status esperado
201 Created
Respuesta relevante

La API devuelve el cliente creado dentro de data:

{
  "data": {
    "id": 19114,
    "name": "Cliente API Bruno Prueba",
    "cuit": "20-12345678-6"
  }
}

El ID mostrado es solo un ejemplo; cambia en cada ejecución.

Post Response Script

El identificador del cliente creado se guarda para utilizarlo en las siguientes requests:

if (res.status === 201 && res.body?.data?.id) {
    bru.setEnvVar("clienteId", res.body.data.id);
    console.log("clienteId guardado correctamente");
}
03 – Consultar Cliente

Objetivo: comprobar que el cliente recién creado puede recuperarse mediante su ID.

Método y endpoint:

GET {{baseUrl}}/api/clients/{{clienteId}}
Headers
Authorization: Bearer {{token}}
Accept: application/json
Payload

No requiere body.

Status esperado
200 OK
Respuesta relevante
{
  "data": {
    "id": 19114,
    "name": "Cliente API Bruno Prueba",
    "cuit": "20-12345678-6",
    "customer_code": "00042"
  }
}

La respuesta debe corresponder al clienteId creado en el paso anterior.

04 – Actualizar Cliente

Objetivo: comprobar que un cliente existente puede ser modificado.

Método y endpoint:

PUT {{baseUrl}}/api/clients/{{clienteId}}
Headers
Authorization: Bearer {{token}}
Content-Type: application/json
Accept: application/json
Payload utilizado
{
  "name": "Cliente API Bruno Actualizado",
  "cuit": "20-12345678-6",
  "email": "",
  "phone": "",
  "whatsapp": "",
  "cbu": null,
  "collection_contact": "",
  "collection_email": "",
  "collection_phone": "",
  "collection_portal_password": "",
  "collection_portal_url": "",
  "collection_portal_username": "",
  "estado": "Activo",
  "serie": "",
  "startdate": "2026-09-02",
  "tax": "",
  "taxes": [],
  "zone": null,
  "zone_name": null
}
Status esperado
200 OK
Respuesta relevante
{
  "data": {
    "id": 19114,
    "name": "Cliente API Bruno Actualizado",
    "cuit": "20-12345678-6"
  }
}

Se debe comprobar que:

data.id == clienteId
data.name == "Cliente API Bruno Actualizado"
05 – Eliminar Cliente

Objetivo: comprobar que un cliente existente puede ser eliminado.

Método y endpoint:

DELETE {{baseUrl}}/api/clients/{{clienteId}}
Headers
Authorization: Bearer {{token}}
Accept: application/json
Payload

No requiere body.

Status esperado
204 No Content
Response

No se espera body.

El status 204 indica que la operación se realizó correctamente y la API no devuelve contenido.

06 – Consultar Cliente Eliminado

Objetivo: comprobar que el cliente eliminado ya no puede recuperarse.

Método y endpoint:

GET {{baseUrl}}/api/clients/{{clienteId}}
Headers
Authorization: Bearer {{token}}
Accept: application/json
Payload

No requiere body.

Status esperado
404 Not Found
Respuesta observada

La API devuelve un mensaje indicando que no existe un resultado para ese cliente:

{
  "message": "No query results for model [App\\Models\\Client] ...",
  "exception": "Symfony\\Component\\HttpKernel\\Exception\\NotFoundHttpException"
}

El ID específico puede variar porque {{clienteId}} se genera dinámicamente.

## 4. Resumen del Happy Path
| Caso | Método	| Endpoint	| Status esperado |
|------|--------|-----------|-----------------|
|Login	| POST	|``/api/login``|``200``|
|Crear cliente	|POST	|``/api/clients``|	``201``|
|Consultar cliente	|GET	|``/api/clients/{{clienteId}}``	|``200``|
|Actualizar cliente|	PUT	|``/api/clients/{{clienteId}}``	|``200``|
|Eliminar cliente	|DELETE	|``/api/clients/{{clienteId}}``	|``204``|
|Consultar cliente eliminado|	GET	|``/api/clients/{{clienteId}}``| ``404``|

Una observación importante: 06-Get-Cliente-Eliminado es técnicamente una prueba negativa, aunque la estamos utilizando para cerrar el Happy Path. El 404 es el resultado correcto porque se quiere demostrar que el DELETE tuvo efecto.

## 5. Headers por tipo de operación

Para que quede muy claro en la documentación:

LOGIN
Content-Type: application/json
Accept: application/json
GET
Authorization: Bearer {{token}}
Accept: application/json
POST / PUT
Authorization: Bearer {{token}}
Content-Type: application/json
Accept: application/json
DELETE
Authorization: Bearer {{token}}
Accept: application/json

## 6. Variables utilizadas

|Variable|	Descripción	|Origen|
|--------|--------------|------|
|``baseUrl``|URL base del backend|	Environment QA|
|``token``	|Token de autenticación	|Response del Login|
|``clienteId``	|ID del cliente utilizado en el CRUD	|Response de Create Cliente|
|``sellerToken``|Token de autenticación del usuario Vendedor|Response del Login Vendedor|
|``sellerClienteId``|ID del cliente utilizado en las pruebas del Vendedor|Response de Create Cliente del Vendedor|

---

## Resumen de casos de prueba

| ID | Request | Caso | Entrada | Status esperado | Status obtenido | Resultado |
|---|---|---|---|---:|---:|---|
| AU-01 | `01-Login-Datos-Vacios.yml` | Login con datos vacíos | `email = ""`, `password = ""` | `422` | `422` | PASS ✅ |
| AU-02 | `02-Login-Datos-Invalidos.yml` | Login con credenciales inválidas | Credenciales completas pero incorrectas | `401` | `401` | PASS ✅ |
| AU-03 | `03-Login-Admin.yml` | Login Admin | Credenciales válidas | `200` | `200` | PASS ✅ |
| AU-04 | `04-Login-Vendedor.yml` | Login Vendedor | Credenciales válidas | `200` | `200` | PASS ✅ |
| CN-01 | `01-Create-Sin-Nombre.yml` | Crear cliente sin nombre | `name = ""` | `422` | `422` | PASS ✅ |
| CN-02 | `02-Create-Sin-CUIT.yml` | Crear cliente sin CUIT | `cuit = ""` | `422` | `422` | PASS ✅ |
| CN-03 | `03-Create-CUIT-Invalido.yml` | Crear cliente con CUIT inválido | `cuit = "ABC123"` | `422` | `201` | FAIL ❌ |
| CN-04 | `04-Create-Email-Invalido.yml` | Crear cliente con email inválido | `email = "correo-invalido"` | `422` | `422` | PASS ✅ |
| CN-05 | `05-Create-Tipo-Dato-Invalido.yml` | Crear cliente con tipo de dato inválido | `name = 12345` | `422` | `422` | PASS ✅ |
| CN-06 | `06-Create-Cliente-Duplicado.yml` | Crear cliente duplicado | Mismo `name` y mismo `cuit` que un cliente existente | `422` | `201` | FAIL ❌ |
| CN-07 | `07-Get-Cliente-Inexistente.yml` | Consultar cliente inexistente | `GET /api/clients/99999999` | `404` | `404` | PASS ✅ |
| CN-08 | `08-Update-Cliente-Inexistente.yml` | Actualizar cliente inexistente | `PUT /api/clients/99999999` | `404` | `404` | PASS ✅ |
| CN-09 | `09-Eliminar-Cliente-Inexistente.yml` | Eliminar cliente inexistente | `DELETE /api/clients/99999999` | `404` | `404` | PASS ✅ |
| SE-01 | `01-Get-Sin-Token.yml` | Consultar clientes sin token | Sin header `Authorization` | `401` | `401` | PASS ✅ |
| SE-02 | `02-Get-Token-Invalido.yml` | Consultar clientes con token inválido | `Bearer token_invalido_12345` | `401` | `401` | PASS ✅ |
| AV-01 | `01-Get-Clientes.yml` | Consultar clientes como Vendedor | `Bearer {{sellerToken}}` | `200` | `200` | PASS ✅ |
| AV-02 | `02-Create-Cliente.yml` | Crear cliente como Vendedor | Payload válido | `201` | `201` | PASS ✅ |
| AV-03 | `03-Update-Cliente.yml` | Actualizar cliente como Vendedor | Payload válido | `200` | `200` | PASS ✅ |
| AV-04 | `04-Delete-Cliente.yml` | Eliminar cliente como Vendedor sin permiso `clientes.delete` | `DELETE /api/clients/{{sellerClienteId}}` | `403` | `204` | FAIL ❌ |
| AV-05 | `05-Get-Cliente-Eliminado.yml` | Verificar cliente eliminado por Vendedor | `GET /api/clients/{{sellerClienteId}}` | `404` | `404` | PASS ✅ |

---

## Casos negativos - Clientes

### 01-Create-Sin-Nombre.yml

- **Caso**: Crear cliente sin nombre
- **Entrada**: `name = ""`
- **Resultado esperado**: la API rechaza la creación
- **Status esperado**: `422`
- **Resultado real**: `422`
- **Mensaje**: `"The name field is required."`
- **Estado**: PASS ✅

### 02-Create-Sin-CUIT.yml

- **Caso**: Crear cliente sin CUIT
- **Entrada**: `cuit = ""`
- **Resultado esperado**: la API rechaza la creación
- **Status esperado**: `422`
- **Resultado real**: `422`
- **Mensaje**: `"The cuit field is required."`
- **Estado**: PASS ✅

### 03-Create-CUIT-Invalido.yml

- **Caso**: Crear cliente con CUIT inválido
- **Entrada**: `cuit = "ABC123"`
- **Resultado esperado**: la API debería rechazar el formato inválido
- **Status esperado**: `422`
- **Resultado real**: `201 Created`
- **Mensaje**: la API permite crear el cliente con un CUIT de formato inválido
- **Estado**: FAIL ❌
- **Hallazgo**: la API permite crear clientes con CUIT de formato inválido

### 04-Create-Email-Invalido.yml

- **Caso**: Crear cliente con email inválido
- **Entrada**: `email = "correo-invalido"`
- **Resultado esperado**: la API rechaza el formato inválido
- **Status esperado**: `422`
- **Resultado real**: `422`
- **Mensaje**: `"Uno o más emails no tienen un formato válido."`
- **Estado**: PASS ✅

### 05-Create-Tipo-Dato-Invalido.yml

- **Caso**: Crear cliente con tipo de dato inválido
- **Entrada**: `name = 12345`
- **Resultado esperado**: la API rechaza la creación porque `name` debe ser texto
- **Status esperado**: `422`
- **Resultado real**: `422`
- **Mensaje**: `"The name field must be a string."`
- **Estado**: PASS ✅

### 06-Create-Cliente-Duplicado.yml

- **Caso**: Crear cliente duplicado
- **Precondición**: existe previamente un cliente con `name = "Cliente API Bruno Prueba"` y `cuit = "20-12345678-6"`
- **Criterio de duplicidad**: para este caso se considera duplicado un registro con el mismo `name` y el mismo `cuit` que un cliente previamente registrado
- **Entrada**: `name = "Cliente API Bruno Prueba"`, `cuit = "20-12345678-6"`
- **Resultado esperado**: la API rechaza la creación del cliente duplicado
- **Status esperado**: `422`
- **Resultado real**: `201 Created`
- **Estado**: FAIL ❌
- **Hallazgo**: la API permite crear nuevamente un cliente con el mismo nombre y CUIT, falta validación de duplicidad o unicidad.

### 07-Get-Cliente-Inexistente.yml

- **Caso**: Consultar cliente inexistente
- **Entrada**: `GET /api/clients/99999999`
- **Resultado esperado**: la API indica que el cliente no existe
- **Status esperado**: `404`
- **Resultado real**: `404`
- **Mensaje**: `"No query results for model [App\\Models\\Client] 99999999"`
- **Estado**: PASS ✅

### 08-Update-Cliente-Inexistente.yml

- **Caso**: Actualizar cliente inexistente
- **Entrada**: `PUT /api/clients/99999999` con payload válido
- **Resultado esperado**: la API rechaza la actualización porque el cliente no existe
- **Status esperado**: `404` (no se espera un `422`, porque el payload es válido; la falla debería producirse por el recurso inexistente)
- **Resultado real**: `404`
- **Mensaje**: `"No query results for model [App\\Models\\Client] 99999999"`
- **Estado**: PASS ✅

### 09-Eliminar-Cliente-Inexistente.yml

- **Caso**: Eliminar cliente inexistente
- **Entrada**: `DELETE /api/clients/99999999`
- **Resultado esperado**: la API rechaza la eliminación porque el cliente no existe
- **Status esperado**: `404`
- **Resultado real**: `404`
- **Mensaje**: `"No query results for model [App\\Models\\Client] 99999999"`
- **Estado**: PASS ✅

---

## Seguridad

### 01-Get-Sin-Token.yml

- **Caso**: Consultar clientes sin token de autenticación
- **Entrada**: `GET /api/clients?sort_direction=asc` sin header `Authorization`
- **Resultado esperado**: la API rechaza el acceso porque no se enviaron credenciales de autenticación
- **Status esperado**: `401`
- **Resultado real**: `401`
- **Mensaje**: `"No autenticado."`
- **Estado**: PASS ✅

### 02-Get-Token-Invalido.yml

- **Caso**: Consultar clientes con token inválido
- **Entrada**: `GET /api/clients?sort_direction=asc` con `Authorization: Bearer token_invalido_12345`
- **Resultado esperado**: la API rechaza el acceso porque el token de autenticación no es válido
- **Status esperado**: `401`
- **Resultado real**: `401`
- **Mensaje**: `"No autenticado."`
- **Estado**: PASS ✅

---

## Casos negativos - Autenticación

### 01-Login-Datos-Vacios.yml

- **Caso**: Iniciar sesión con email y contraseña vacíos
- **Entrada**: `email = ""`, `password = ""`
- **Resultado esperado**: la API rechaza la autenticación y valida los campos obligatorios
- **Status esperado**: `422`
- **Resultado real**: `422`
- **Mensaje**: `"Los datos proporcionados no son válidos."`
- **Errores**: `"The email field is required."` y `"The password field is required."`
- **Estado**: PASS ✅

### 02-Login-Datos-Invalidos.yml

- **Caso**: Iniciar sesión con credenciales inválidas
- **Entrada**: email con formato válido y contraseña informada, pero credenciales incorrectas
- **Resultado esperado**: la API rechaza la autenticación
- **Status esperado**: `401`
- **Resultado real**: `401`
- **Mensaje**: `"Las credenciales proporcionadas son incorrectas."`
- **Estado**: PASS ✅

---

## Autorización - Vendedor

### 04-Login-Vendedor.yml

- **Caso**: Iniciar sesión con usuario Vendedor
- **Entrada**: `POST /api/login` con credenciales válidas del usuario Vendedor
- **Resultado esperado**: la API autentica correctamente al usuario y retorna un token de acceso
- **Status esperado**: `200`
- **Resultado real**: `200`
- **Mensaje**: se retorna `access_token` con `token_type = "Bearer"` y el usuario posee rol `"Vendedor"`
- **Estado**: PASS ✅

### 01-Get-Clientes.yml

- **Caso**: Consultar listado de clientes con usuario Vendedor
- **Entrada**: `GET /api/clients?sort_direction=asc` con `Authorization: Bearer {{sellerToken}}`
- **Resultado esperado**: el usuario Vendedor puede consultar clientes porque posee el permiso `clientes.view`
- **Status esperado**: `200`
- **Resultado real**: `200`
- **Mensaje**: se retorna correctamente el listado paginado de clientes
- **Estado**: PASS ✅

### 02-Create-Cliente.yml

- **Caso**: Crear cliente con usuario Vendedor
- **Entrada**: `POST /api/clients` con payload válido y `Authorization: Bearer {{sellerToken}}`
- **Resultado esperado**: el usuario Vendedor puede crear clientes porque posee el permiso `clientes.create`
- **Status esperado**: `201`
- **Resultado real**: `201`
- **Mensaje**: se crea correctamente el cliente `"Cliente Vendedor Bruno"` y se retorna su identificador
- **Estado**: PASS ✅

### 03-Update-Cliente.yml

- **Caso**: Actualizar cliente con usuario Vendedor
- **Entrada**: `PUT /api/clients/{{sellerClienteId}}` con payload válido y `Authorization: Bearer {{sellerToken}}`
- **Resultado esperado**: el usuario Vendedor puede actualizar clientes porque posee el permiso `clientes.edit`
- **Status esperado**: `200`
- **Resultado real**: `200`
- **Mensaje**: se actualiza correctamente el nombre a `"Cliente Vendedor Bruno Actualizado"`
- **Estado**: PASS ✅

### 04-Delete-Cliente.yml

- **Caso**: Eliminar cliente con usuario Vendedor sin permiso `clientes.delete`
- **Entrada**: `DELETE /api/clients/{{sellerClienteId}}` con `Authorization: Bearer {{sellerToken}}`
- **Resultado esperado**: la API rechaza la eliminación porque el usuario Vendedor no posee el permiso `clientes.delete`
- **Status esperado**: `403`
- **Resultado real**: `204`
- **Mensaje**: la API elimina correctamente el cliente pese a que el usuario no posee permiso de eliminación
- **Estado**: FAIL ❌
- **Hallazgo**: durante las pruebas con el rol Vendedor se identificó que la API declara los permisos `clientes.view`, `clientes.create` y `clientes.edit`, pero no `clientes.delete`. Sin embargo, al ejecutar una solicitud `DELETE` sobre un cliente utilizando el token del Vendedor, la API respondió `204 No Content` y una consulta posterior confirmó que el registro había sido eliminado. Esto evidencia una posible ausencia o incorrecta aplicación del control de autorización en el endpoint `DELETE /api/clients/{id}`.

### 05-Get-Cliente-Eliminado.yml

- **Caso**: Verificar eliminación de cliente realizada por usuario Vendedor
- **Entrada**: `GET /api/clients/{{sellerClienteId}}` con `Authorization: Bearer {{sellerToken}}`
- **Resultado esperado**: el cliente eliminado ya no debe existir
- **Status esperado**: `404`
- **Resultado real**: `404`
- **Mensaje**: `"No query results for model [App\\Models\\Client] ..."`
- **Estado**: PASS ✅
