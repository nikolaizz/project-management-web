CREATE TYPE "UnitKerjaDeveloper" AS ENUM ('ADV', 'RDL', 'WDL', 'DMA');

ALTER TABLE "Project"
  ADD COLUMN "unitKerjaDeveloper" "UnitKerjaDeveloper"[] NOT NULL DEFAULT ARRAY[]::"UnitKerjaDeveloper"[];
