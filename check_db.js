const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const evals = await prisma.evaluation.findMany({
    include: { employee: true, branch: true, evaluator: true }
  });
  console.log(JSON.stringify(evals, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
