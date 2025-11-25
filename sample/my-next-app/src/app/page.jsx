import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import prisma from '@/lib/db';

export default async function HomePage() {
  // fetch a small set of products from the DB so adding-to-cart uses DB ids
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' }, take: 3 });
  return (
    <>
      <Hero />
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16,padding:"20px" }}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </section>
    </>
  );
}
