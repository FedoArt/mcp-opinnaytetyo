import express from "express";
import mysql from "mysql2/promise";
import { z } from "zod";
import dotenv from "dotenv";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

dotenv.config();

const app = express();

app.use(express.json());


// MariaDB-yhteys
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});


// MCP HTTP endpoint
app.post("/", async (req, res) => {
  try {

    // MCP:n HTTP-siirtokerros
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });


    // MCP-serveri
    const server = new McpServer({
      name: "Opinnaytetyo MCP Server",
      version: "1.0.0",
    });


    // TOOL 1: hakee kaikki vaiheet
    server.registerTool(
      "hae-vaiheet",
      {
        title: "Hae opinnäytetyön vaiheet",
        description: "Hakee opinnäytetyön vaiheet tietokannasta",
      },

      async () => {
        try {

          const [rows] = await pool.query<mysql.RowDataPacket[]>(
            "SELECT vaihe FROM vaiheet;"
          );

          const vaiheet = rows.map((row) => row.vaihe);

          return {
            content: [
              {
                type: "text",
                text: vaiheet.join("\n"),
              },
            ],
          };

        } catch (error) {

          console.error("Tietokantavirhe:", error);

          return {
            content: [
              {
                type: "text",
                text: "Vaiheiden hakeminen epäonnistui.",
              },
            ],
            isError: true,
          };
        }
      }
    );


    // TOOL 2: hakee yhden vaiheen selityksen
    server.registerTool(
      "hae-vaiheen-selitys",
      {
        title: "Hae vaiheen selitys",

        description:
          "Hakee opinnäytetyön vaiheen selityksen tietokannasta",

        inputSchema: {
          vaihe: z.string().describe("Opinnäytetyön vaihe"),
        },
      },

      async ({ vaihe }) => {
        try {

          const like = `%${vaihe}%`;

          const [rows] = await pool.query<mysql.RowDataPacket[]>(
            "SELECT selitys FROM vaiheet WHERE vaihe LIKE ?;",
            [like]
          );

          if (rows.length === 0) {
            return {
              content: [
                {
                  type: "text",
                  text: `Vaihetta "${vaihe}" ei löytynyt.`,
                },
              ],
            };
          }

          return {
            content: [
              {
                type: "text",
                text: rows[0].selitys,
              },
            ],
          };

        } catch (error) {

          console.error("Tietokantavirhe:", error);

          return {
            content: [
              {
                type: "text",
                text: "Vaiheen selityksen hakeminen epäonnistui.",
              },
            ],
            isError: true,
          };
        }
      }
    );


    // Yhdistetään MCP-serveri HTTP transportiin
    await server.connect(transport);


    // Käsitellään clientilta tullut MCP-pyyntö
    await transport.handleRequest(req, res, req.body);

  } catch (error) {

    console.error("MCP-virhe:", error);

    if (!res.headersSent) {
      res.status(500).json({
        error: "Palvelimella tapahtui virhe",
      });
    }
  }
});


const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Serveri käynnissä osoitteessa http://localhost:${PORT}`);
});