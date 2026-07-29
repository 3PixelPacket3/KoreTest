# Kore | Enterprise Cloud Vault

Kore is a centralized, cloud-hosted suite of administrative, operational, and personal productivity tools. Designed with a mobile-first, professional architecture, it consolidates daily workflow utilities, secure credential management, and automated HTML generation into a single secure portal.

## 🏗️ Architecture

This project is built using a decoupled architecture optimized for serverless deployment:

* **Frontend:** Vanilla HTML5, CSS3 (Custom properties/variables), and JavaScript. No heavy frontend frameworks are used, ensuring lightning-fast load times and DOM manipulation.
* **Backend / API:** Python-based serverless API deployed via Azure Functions (`api/function_app.py`). Handles user data persistence and integration.
* **Hosting & CI/CD:** Azure Static Web Apps. The deployment pipeline is entirely automated via GitHub Actions.

## 🚀 Key Modules & Applications

The Kore dashboard routes to several specialized modules:

* **Application Directory (`apps.html`):** A custom drag-and-drop quick-link portal with category folder grouping and visual icon support.
* **Product HTML Converter (`product-html.html`):** A robust tool for generating, reverse-engineering, and bulk-processing responsive e-commerce product descriptions. Includes Base64 metadata injection for future-proofing legacy edits.
* **Nebula HTML Forge (`nebula.html`):** Advanced HTML structural builder.
* **Vulnerability Scanner (`scanner.html`):** Integrated security tooling.
* **Data & File Operations:** Includes `file-converter.html` and `lod.html` for automated cataloging and data validation workflows.
* **Secure Utilities:** Password generation (`passwords.html`) and personal task tracking (`todo.html`, `work.html`).

## ⚙️ Local Development Setup

To run this project locally, you will need the Azure Static Web Apps CLI (SWA CLI) to emulate the cloud environment and link the frontend to the Python backend.

1. **Prerequisites:**
   * Node.js (for SWA CLI)
   * Python 3.10+ (for local API execution)
   * Azure Functions Core Tools

2. **Install SWA CLI:**
   ```bash
   npm install -g @azure/static-web-apps-cli
