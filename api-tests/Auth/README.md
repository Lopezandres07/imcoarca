# Documentación API - Módulo Clientes

## 1. Información general

Frontend: https://imcoarca.leonardojose.dev/

Base URL API: https://back-imcoarca.leonardojose.dev

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

token se obtiene dinámicamente mediante el ``Login`` y ``clienteId`` se obtiene dinámicamente al crear un cliente.

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

Por seguridad, el valor real de access_token no debe almacenarse en la documentación ni subirse al repositorio.

Post Response Script

El token se almacena automáticamente en el Environment QA:

if (res.status === 200 && res.body?.access_token) {
    bru.setEnvVar("token", res.body.access_token);
    console.log("Token guardado correctamente");
}

## 3. Clientes – Happy Path

El Happy Path valida el ciclo CRUD completo utilizando un mismo cliente:

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

Una observación importante: 06-Get-Cliente-Eliminado es técnicamente una prueba negativa, aunque la estamos utilizando para cerrar el Happy Path. El 404 es el resultado correcto porque queremos demostrar que el DELETE tuvo efecto.

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


