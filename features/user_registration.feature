Feature: Registro de usuario
  Como cliente nuevo 
  Quiero crear una cuenta con mi correo y teléfono
  Para llevar un registro de mis tratamientos y agendar más rápido

  Background:
    Given el usuario se encuentra en la página de registro

  @register @success
  Scenario: Registro exitoso con datos válidos
    When el usuario ingresa un nombre válido "Maria Lopez"
    And el usuario ingresa un correo nuevo "maria@example.com"
    And el usuario ingresa un teléfono "123456789"
    And el usuario ingresa una contraseña segura
    And hace clic en "Crear cuenta"
    Then el sistema debe registrar al usuario correctamente
    And debe iniciar su sesión
    And el usuario debe ser redirigido al Dashboard

  @register @negative
  Scenario: Intento de registro con un correo duplicado
    Given ya existe una cuenta registrada con el correo "maria@example.com"
    When el usuario ingresa un nombre válido "Maria Lopez"
    And el usuario ingresa el correo duplicado "maria@example.com"
    And el usuario ingresa un teléfono "123456789"
    And el usuario ingresa una contraseña segura
    And hace clic en "Crear cuenta"
    Then el sistema debe rechazar el registro
    And debe mostrar un mensaje de error "El correo ingresado ya está en uso"
