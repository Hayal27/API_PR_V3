const axios = require('axios');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3Mywicm9sZV9pZCI6NSwiaWF0IjoxNzg2OTU2OTE3LCJleHAiOjE3ODgzOTY5MTd9.z20wre56kRS2HSTE106h7PXRc5nLHDlTOSwxDlXEZXU";

async function testKpisEndpoint() {
    try {
        console.log("\n==========================================");
        console.log("🧪 TESTING /api/kpis/my-assigned ENDPOINT");
        console.log("==========================================");

        const res = await axios.get("https://prms.ethiopianitpark.com/api/kpis/my-assigned", {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("RAW RESPONSE DATA:");
        console.log(res.data);
        console.log("==========================================\n");
    } catch (err) {
        console.error("❌ HTTP Error:", err.response ? err.response.status : err.message);
        if (err.response) {
            console.error("❌ Response body:", err.response.data);
        }
    }
}

testKpisEndpoint();
