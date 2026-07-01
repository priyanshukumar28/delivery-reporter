const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const lob = await prisma.lOB.upsert({
    where: { name: "Auto LOB" },
    update: {},
    create: { name: "Auto LOB", headName: "LOB Head", headPhone: "919999999999" }
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "admin@deliveryreporter.com" },
    update: {},
    create: { name: "Super Admin", email: "admin@deliveryreporter.com", passwordHash, role: "SUPER_ADMIN" }
  });

  await prisma.user.upsert({
    where: { email: "analyst@deliveryreporter.com" },
    update: {},
    create: { name: "Priyanshu", email: "analyst@deliveryreporter.com", passwordHash, role: "ANALYST", lobId: lob.id }
  });

  console.log("Seed complete. All demo users share the password: password123");
}

main().finally(() => prisma.$disconnect());
