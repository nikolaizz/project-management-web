CREATE TABLE "DashboardAiSummary" (
    "key" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "dataHash" TEXT NOT NULL,
    "dataAsOf" TIMESTAMP(3) NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardAiSummary_pkey" PRIMARY KEY ("key")
);
