-- DropTable
DROP TABLE IF EXISTS "HistoricalBalance";

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN IF EXISTS "balance";
