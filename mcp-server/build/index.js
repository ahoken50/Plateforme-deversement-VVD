import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import admin from "firebase-admin";
// Initialize Firebase Admin
// Note: This requires GOOGLE_APPLICATION_CREDENTIALS to be set or a service account key
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
    }
    catch (error) {
        console.error("Failed to initialize Firebase Admin:", error);
    }
}
const db = admin.firestore();
const server = new Server({
    name: "plateforme-vvd-mcp-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "list_reports",
                description: "List dumping reports from Firestore",
                inputSchema: {
                    type: "object",
                    properties: {
                        limit: {
                            type: "number",
                            description: "Number of reports to return (default 10)",
                        },
                    },
                },
            },
            {
                name: "get_stats",
                description: "Get global statistics",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
        case "list_reports": {
            const limit = Number(request.params.arguments?.limit) || 10;
            try {
                const snapshot = await db.collection("reports").limit(limit).get();
                const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(reports, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error fetching reports: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
        case "get_stats": {
            try {
                // Example: Count total reports
                const snapshot = await db.collection("reports").count().get();
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({ total_reports: snapshot.data().count }, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error fetching stats: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
        default:
            throw new Error("Unknown tool");
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
