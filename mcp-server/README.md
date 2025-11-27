# Plateforme VVD MCP Server

This is a Model Context Protocol (MCP) server that exposes data from the Plateforme de deversement VVD Firestore database to AI agents.

## Prerequisites

- Node.js
- Firebase Service Account Key (or Google Application Credentials)

## Setup

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Set up credentials:
    - Download your Firebase Service Account Key JSON.
    - Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of the JSON file.

## Running

```bash
npm start
```

## Tools

- `list_reports`: List dumping reports.
- `get_stats`: Get global statistics.
