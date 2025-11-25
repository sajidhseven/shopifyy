const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking DB connectivity and demo data...');

  const products = await prisma.product.findMany({ take: 5 });
  console.log('Products found:', products.length);

  if (products.length === 0) {
    console.log('No demo products in DB — run `npm run seed` to seed demo products.');
    return;
  }

  // ensure a user exists to attach cart item to
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({ data: { email: 'check@example.com', passwordHash: 'password', role: 'CUSTOMER' } });
    console.log('Created temporary user id:', user.id);
  } else {
    console.log('Using user id:', user.id);
  }

  // pick first product
  const product = products[0];
  console.log('Testing cart insert with product id:', product.id);

  try {
    const cartItem = await prisma.cartItem.create({ data: { userId: user.id, productId: product.id, qty: 1 } });
    console.log('Created test cart item:', cartItem.id);

    // cleanup
    await prisma.cartItem.delete({ where: { id: cartItem.id } });
    console.log('Test cart item removed. DB seems healthy.');
  } catch (err) {
    console.error('Failed to create cart item:', err.message || err);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
