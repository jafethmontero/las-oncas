const Airtable = require("airtable");

exports.handler = async (event) => {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.BASE_ID;
  const secretKey = process.env.SECRET_API_KEY;
  const tableName = "Table1"; //"Footages"; // Make sure this matches your actual Airtable table name

  const base = new Airtable({ apiKey: token }).base(baseId);

  // CORS Headers
  const headers = {
    "Access-Control-Allow-Origin": "*", // 🔥 Change to your frontend URL for security
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    "Content-Type": "application/json",
  };

  // 🔥 Handle preflight OPTIONS request (important for CORS)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Check API Key in headers
  const clientKey = event.headers["x-api-key"];
  if (!clientKey || clientKey !== secretKey) {
    return {
      statusCode: 403,
      headers, // 🔥 Add CORS headers here too
      body: JSON.stringify({ error: "Unauthorized access jafet" }),
    };
  }

  try {
    const records = await base(tableName).select({ maxRecords: 100 }).all();

    return {
      statusCode: 200,
      headers, // 🔥 Add CORS headers here too
      body: JSON.stringify(records.map((record) => record.fields)),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers, // 🔥 Add CORS headers here too
      body: JSON.stringify({ error: error.message }),
    };
  }
};
