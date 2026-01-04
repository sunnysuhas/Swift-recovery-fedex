# RecoveryAI - FedEx DCA Intelligence Platform

This is an AI-powered digital transformation solution that revolutionizes how FedEx manages external debt collection agencies (DCAs). The platform provides a unified, intelligent system for end-to-end debt recovery management, replacing spreadsheets and fragmented communications.

## Core Features

-   **AI-Powered Case Prioritization**: Leverages machine learning models to predict recovery probability and intelligently prioritize cases.
-   **Admin Dashboard**: An enterprise dashboard for real-time visibility into recovery metrics, SLA compliance, aging analysis, and DCA performance.
-   **DCA Portal**: A dedicated portal for external agencies to access assigned cases, update statuses, and manage their workload.
-   **Reporting and Analytics**: Rich, interactive dashboards displaying critical KPIs like recovery rates, average closure time, and more.
-   **SLA Monitoring & Audit Logging**: Automated monitoring and comprehensive, tamper-evident audit trails for governance and compliance.

## Tech Stack

-   **Framework**: Next.js (App Router)
-   **Styling**: Tailwind CSS
-   **UI Components**: shadcn/ui
-   **AI**: Google Gemini via Genkit
-   **Charting**: Recharts

## Getting Started

To get started with the development environment:

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:9002`.

The main pages of the application are:
-   **Admin Dashboard**: `/`
-   **All Cases**: `/cases`
-   **DCA Portal**: `/dca`
