const { ChromaClient } = require("chromadb");

const client = new ChromaClient({
  path: process.env.CHROMA_URL || "http://localhost:8000"
});

async function getContextFromVectorDB(query) {
  const collection = await client.getCollection({ name: "mi_base" });

  const results = await collection.query({
    queryTexts: [query],
    nResults: 3
  });

  return results.documents.flat().join("\n");
}

module.exports = { getContextFromVectorDB };
