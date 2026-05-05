# com.contax.warehouseAnalytics

## Overview
This repository contains a multi-package project for a SAPUI5 application located in `myui5app`.
The UI5 app uses the SAP Fiori tools / UI5 tooling and can be started locally using the `fiori` command.

## Prerequisites
- Node.js 18+ (or a supported LTS version)
- npm (included with Node.js)
- A compatible SAPUI5/OpenUI5 runtime and UI5 tooling installed automatically by the project dependencies

## Install Dependencies
From the repository root:
```bash
npm install
```
This installs the root workspace dependencies and the `myui5app` package dependencies.

## Run the UI5 App Locally

From the repository root:

```bash
npm run start:myui5app
```

This runs the `myui5app` package and opens `index.html` in your browser.

Alternatively, from the app folder:

```bash
cd myui5app
npm start
```
The app will automatically open at `http://localhost:8080/index.html`*

## Project Structure

- `myui5app/` — SAPUI5 application package
  - `webapp/` — UI5 application sources
  - `ui5.yaml` — UI5 tooling configuration
  - `package.json` — app package scripts and dependencies

## Notes

- If you are using a corporate network or proxy, ensure your npm config is set correctly.
- If the app does not open automatically, open the browser at the local server URL shown in the terminal.
