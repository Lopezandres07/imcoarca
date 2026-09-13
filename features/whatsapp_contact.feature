Feature: Contacto por WhatsApp para consulta de servicios
  Como usuario de la plataforma
  Quiero contactar por WhatsApp sobre un servicio de mi interés
  Para solicitar información de manera rápida
  
    Background:
        Given el usuario se encuentra navegando en la plataforma

    @whatsapp @guest
    Scenario: El usuario invitado quiere contactar por un servicio vía WhatsApp
        Given el usuario no ha iniciado sesión
        And se encuentra en la página de inicio
        When hace clic en el botón flotante de Whatsapp
        Then se debe mostrar un menú emergente para ingresar datos
        When el usuario ingresa su nombre "John Doe"
        And selecciona el servicio "Pink Glow" de la lista
        And hace clic en "Ir al chat"
        Then el sistema debe registrar el interés del usuario por el servicio "Pink Glow"
        And debe redirigirlo al chat de WhatsApp
        And el mensaje debe incluir "John Doe" y "Pink Glow"
        
    @whatsapp @guest @success
    Scenario: El usuario invitado navegó por un servicio específico antes de contactar
        Given el usuario no ha iniciado sesión
        And se encuentra en la página del servicio "PRP"
        When hace clic en el botón flotante de Whatsapp
        Then el servicio "PRP" debe estar preseleccionado en el menú emergente
        When el usuario ingresa su nombre "John Doe"
        And hace clic en "Ir al chat"
        Then el sistema debe registrar su interés por el servicio "PRP"
        And debe redirigirlo al chat de WhatsApp
        And el mensaje debe incluir "John Doe" y "PRP"

    @whatsapp @auth @success
    Scenario: Usuario autenticado consulta por un servicio vía WhatsApp
        Given el usuario ha iniciado sesión como "John Doe"
        When hace clic en el botón flotante de WhatsApp
        Then se debe mostrar el menú con el nombre "John Doe" ya completado
        And el campo de nombre debe ser de solo lectura
        When el usuario selecciona el servicio "PRP"
        And hace clic en "Ir al chat"
        Then el sistema debe registrar su interés por el servicio "PRP"
        And debe redirigirlo al chat de WhatsApp
        And el mensaje debe incluir "John Doe" y "PRP"

    @whatsapp @negative
    Scenario Outline: Validación de campos obligatorios en el menú de contacto
        Given el usuario no ha iniciado sesión
        And se encuentra en la página de inicio
        When hace clic en el botón flotante de whatsapp
        And el usuario ingresa su nombre "<nombre>"
        And selecciona el servicio "<servicio>" de la lista
        Then el botón de "Ir al chat" debe estar <estado>
        And debe mostrar un mensaje de error "<mensaje>"
        Examples:
            | nombre   | servicio  | estado       | mensaje                   |
            |          | PRP       | deshabilitado| El nombre es obligatorio  |
            | John Doe |           | deshabilitado| Seleccione un servicio    |