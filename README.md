# Tehtävä 6 - MCP Server

Express-pohjainen MCP-serveri, joka käyttää Streamable HTTP -siirtotapaa ja hakee opinnäytetyön vaiheita MariaDB-tietokannasta.

## MCP-työkalut

### hae-vaiheet

Hakee kaikki opinnäytetyön vaiheet MariaDB:n `vaiheet`-taulusta.

### hae-vaiheen-selitys

Hakee annetun vaiheen selityksen tietokannasta.

Esimerkiksi parametrilla:

viimeistelyvaihe

palautetaan viimeistelyvaiheen selitys.

## Teknologiat

- Node.js
- TypeScript
- Express
- MariaDB
- mysql2
- Model Context Protocol SDK
- Zod

## Käynnistäminen

Asenna paketit:

npm install

Luo `.env`-tiedosto:

DB_HOST=localhost
DB_USER=mcpuser
DB_PASSWORD=oma_salasana
DB_NAME=opinnaytetyot

Käynnistä serveri:

npx tsx server.ts

Serveri käynnistyy osoitteeseen:

http://localhost:3000/

## Testaus

MCP-serveri testattiin MCP Inspectorilla sekä Claude-sovelluksella.

Molemmat työkalut toimivat ja hakevat tiedot MariaDB-tietokannasta.
