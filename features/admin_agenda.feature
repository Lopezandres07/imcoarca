Feature: Flujo de Administracion y Gestion de Agenda
  Como administradora (Aurora)
  Quiero ver un calendario con todas las citas del dia 
  Para organizar mi tiempo y preparar los insumos necesarios

  Background:
    Given la administradora Aurora ha iniciado sesión correctamente
    And se encuentra en el panel del calendario ("Dashboard")

  @admin @control
  Scenario Outline: Gestionar el estado de una cita programada
    Given existe una cita en agenda para hoy con la clienta "Valeria Roa" con estado inicial "Pendiente"
    When la administradora selecciona la cita en el calendario
    And cambia el estado de la cita a "<nuevo_estado>"
    Then el sistema debe actualizar el estado de la cita a "<nuevo_estado>"
    And la cita debe aparecer visualmente con un color diferente que identifique el estado "<nuevo_estado>"
    Examples:
      | nuevo_estado |
      | Completada   |
      | Cancelada    |

  @admin @historial
  Scenario: Consultar el historial de servicios de un cliente específico antes de su cita
    Given existe una cita en agenda para la clienta "Valeria Roa" programada a las 14:00 horas
    When la administradora hace clic en el nombre "Valeria Roa" en el detalle de la cita
    And selecciona la opción "Ver historial de cliente"
    Then el sistema debe abrir el perfil completo de la clienta
    And debe listar los servicios que la clienta se ha realizado en visitas anteriores "Pink Glow" y "Vitaminas"
