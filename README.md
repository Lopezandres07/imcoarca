# 🚀 Estrategia de Aseguramiento de Calidad - Pruebas E2E (Proyecto Final)

[![Playwright Tests](https://github.com/Lopezandres07/imcoarca/actions/workflows/playwright.yml/badge.svg)](https://github.com/Lopezandres07/imcoarca/actions)
[![Allure Report](https://img.shields.io/badge/Allure_Report-View_Report-blue?logo=qgis)](https://lopezandres07.github.io/imcoarca/)

Este repositorio contiene la implementación técnica del plan de pruebas automatizadas E2E (End-to-End) para el Proyecto Final. El objetivo principal es garantizar la integridad, funcionalidad y seguridad del sistema, asegurando una cobertura completa de los procesos operativos clave mediante el framework **Playwright**.

---

## 🎯 Alcance del Proyecto

La validación rigurosa abarca los siguientes componentes críticos del sistema:

*   **🔒 Seguridad y Acceso:** Validación integral de los mecanismos de login, comprobando la autenticación y los permisos basados en roles (Administrador y Vendedor) para proteger la información.
*   **📦 Módulos Básicos (Data Maestra):** Pruebas funcionales sobre la gestión de **Clientes** y **Artículos**, verificando la correcta persistencia, creación y manipulación de datos.
*   **💰 Módulos Transaccionales:** Pruebas E2E enfocadas en los flujos financieros de **Facturas** y **Cobros**, garantizando que operen según las reglas de negocio establecidas.

*(Nota: Como parte de los entregables de este proyecto final, también se incluyen archivos `.gherkin` con el diseño de escenarios BDD para una aplicación temática complementaria, validando metodologías de QA).*

---

## 🛠️ Stack Tecnológico

*   **Framework de Pruebas:** [Playwright](https://playwright.dev/) con TypeScript.
*   **Reportes:** [Allure Report](https://allurereport.org/) integrado con `allure-playwright`.
*   **Gestor de Entorno:** `dotenv` para manejo seguro de credenciales.
*   **CI/CD:** GitHub Actions y despliegue automático en GitHub Pages.

---

## ⚙️ Requisitos Previos

Para que el profesor o cualquier evaluador pueda ejecutar el proyecto localmente, es necesario contar con:
*   [Node.js](https://nodejs.org/) (Versión 20 o superior recomendada).
*   Git.

---

## 🚀 Instalación y Configuración Local

**1. Clonar el repositorio y acceder al directorio (si aplica):**
```bash
git clone [https://github.com/Lopezandres07/imcoarca.git](https://github.com/Lopezandres07/imcoarca.git)
cd imcoarca
# Si tus tests están en la carpeta test_e2e: cd test_e2e
