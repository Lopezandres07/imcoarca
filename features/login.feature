Feature: Inicio de sesión y control de acceso
  Como cliente registrado de la plataforma
  Quiero iniciar sesión con mis credenciales
  Para acceder de forma segura a las funcionalidades de mi cuenta

  Background:
      Given el usuario tiene una cuenta registrada
      And no ha iniciado sesión

  @login @success
  Scenario: Inicio de sesión exitoso
    When el usuario ingresa sus credenciales válidas
    And hace clic en "Iniciar sesión"
    Then el sistema debe autenticar al cliente correctamente
    And debe redirigirlo al Dashboard

  @login @negative
  Scenario: Inicio de sesión rechazado con contraseña incorrecta
    Given el usuario tiene una cuenta registrada con el correo "maria@example.com"
    When ingresa el correo "maria@example.com"
    And ingresa una contraseña incorrecta
    And hace clic en "Iniciar sesión"
    Then el sistema debe rechazar el inicio de sesión
    And debe mostrar un mensaje "Contraseña incorrecta"

  @login @security
  Scenario: Intento de acceder al historial de citas sin iniciar sesión (Protección de rutas)
    When intenta acceder directamente a la ruta protegida "/historial-citas"
    Then el sistema debe denegar el acceso
    And el usuario debe ser redirigido a la página de inicio de sesión
    And debe mostrar un mensaje "Debes iniciar sesión para ver esta página"
