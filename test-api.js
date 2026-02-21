// @ts-check
const { GET } = require("./src/app/api/finance/transactions/[id]/route.ts");

async function run() {
  console.log("Testing valid transaction tx-123...");
  const mockReq1 = {
    headers: new Map(), // No auth header
  };

  const res1 = await GET(mockReq1, {
    params: Promise.resolve({ id: "tx-123" }),
  });
  console.log("Status tx-123:", res1.status);
  if (res1.status === 200) {
    const data = await res1.json();
    console.log(
      "tx-123 data valid?:",
      data.id === "tx-123" && !!data.auditTrail && !!data.blockchainInfo,
    );
    console.log("Explorer URL:", data.blockchainInfo?.explorerUrl);
  }

  console.log("\nTesting invalid transaction rx-999...");
  const res2 = await GET(mockReq1, {
    params: Promise.resolve({ id: "rx-999" }),
  });
  console.log("Status rx-999:", res2.status);

  console.log("\nTesting different organization other-org-1...");
  const res3 = await GET(mockReq1, {
    params: Promise.resolve({ id: "other-org-1" }),
  });
  console.log("Status other-org:", res3.status);
}

run().catch(console.error);
