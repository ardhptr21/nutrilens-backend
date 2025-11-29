-- CreateTable
CREATE TABLE "nutritions" (
    "id" TEXT NOT NULL,
    "log_at" DATE NOT NULL,
    "target_cal" DECIMAL(65,30) NOT NULL DEFAULT 2500,
    "target_fat" DECIMAL(65,30) NOT NULL DEFAULT 70,
    "target_carbs" DECIMAL(65,30) NOT NULL DEFAULT 275,
    "target_protein" DECIMAL(65,30) NOT NULL DEFAULT 50,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutritions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meals" (
    "id" TEXT NOT NULL,
    "nutrition_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cal" DECIMAL(65,30) NOT NULL,
    "fat" DECIMAL(65,30) NOT NULL,
    "protein" DECIMAL(65,30) NOT NULL,
    "carbs" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_nutrition_id_fkey" FOREIGN KEY ("nutrition_id") REFERENCES "nutritions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
