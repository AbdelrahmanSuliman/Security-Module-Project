-- CreateTable
CREATE TABLE "NurseAssignment" (
    "id" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NurseAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NurseAssignment_nurseId_doctorId_key" ON "NurseAssignment"("nurseId", "doctorId");

-- AddForeignKey
ALTER TABLE "NurseAssignment" ADD CONSTRAINT "NurseAssignment_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NurseAssignment" ADD CONSTRAINT "NurseAssignment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
