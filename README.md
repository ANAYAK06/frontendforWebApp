# Custom Workflow Web App: Front End

The React front end for a modular business management platform for project-based companies. Every important record goes through a configurable, multi-level approval workflow. Approvers review it from a shared inbox, add remarks and a signature, and are alerted in real time when something needs their attention.

The Node.js / Express / MongoDB API lives in a separate repository: [CustomWorflowWebApp](https://github.com/ANAYAK06/CustomWorflowWebApp).

## Modules

| Area | Screens |
|---|---|
| **Projects** | Business opportunities and tenders, Bill of Quantities (BOQ) upload from Excel, BOQ rate revisions with rate history, client BOQ, tender final status (won / lost), and a multi-step Client PO wizard with billing plan |
| **Accounts** | Account groups, sub-groups and ledgers, bank accounts, loans, fixed deposits, clients and sub-clients |
| **Cost centres and budgets** | New cost centres, cost-centre budgets, DCA codes and DCA budgets, user cost-centre access |
| **Inventory** | Item codes, units with conversion helper, material requisitions |
| **Tax** | HSN / SAC codes and TDS accounts |
| **Reports** | Balance sheet and profit and loss |
| **Administration** | Users, roles, approval hierarchies and workflow view |

Every "create" screen has a matching "verify" screen, so the approval flow works the same way across all modules.

## Features

- **Approval inbox:** one inbox lists every pending document for the user's role, with remarks and signature capture (`SignatureAndRemarks`).
- **Dashboard:** budget, sales and purchase charts (Chart.js), project status, quick links and recent transactions.
- **Data grids:** AG Grid for large tables such as BOQ items, with drag-and-drop columns.
- **Excel and PDF:** import BOQs from Excel (SheetJS) and export documents to PDF.
- **Smart Track bot:** an in-app chat assistant (`SmartTrackBot`) that answers plain-language questions such as "check status of PO-12345" with the document's current approval status.
- **Role-based navigation:** the side menu is built from the user's role permissions.

## Architecture

```
src/
  Pages/        screens, grouped by module (Accounts, Projects, Inventory, TaxModule, Reports)
  Components/   shared UI: charts, modals, inbox widgets, chatbot, navigation
  Slices/       Redux Toolkit slices with async thunks, one per business area
  api/          Axios API clients per module
  store/        Redux store
  hooks/        custom hooks
```

State is managed with Redux Toolkit. Each business area has its own slice and API client, and pages dispatch thunks rather than calling the API directly. In development, API calls use relative `/api/...` paths, and the `proxy` setting in `package.json` forwards them to the back end on port 4000.

## Running locally

Start the [back end](https://github.com/ANAYAK06/CustomWorflowWebApp) on port 4000 first, then:

```bash
npm install
npm start          # http://localhost:3000
```

To create a production build:

```bash
npm run build
```

## Tech stack

React 18 · Redux Toolkit · React Router · Axios · AG Grid · Chart.js · Tailwind CSS · SheetJS (xlsx) · html2pdf · react-dnd
