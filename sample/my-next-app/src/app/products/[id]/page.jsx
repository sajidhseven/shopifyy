import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";


export async function generateStaticParams() {
	// pre-generate params from the DB so the product detail pages point to real DB rows
	const all = await prisma.product.findMany({ select: { id: true }, orderBy: { createdAt: "desc" } });

	return all.map((p) => ({ id: p.id }));
}


export default async function ProductDetail({ params }) {
	const product = await prisma.product.findUnique({ where: { id: params.id } });
	if (!product) return notFound();


return (
<>
<article className="product">
{/* eslint-disable-next-line @next/next/no-img-element */}
<img src={product.image} alt={product.name} />
<div>
<h1>{product.name}</h1>
<p className="price">₹{product.price}</p>
<p>Minimalist, comfortable, and durable — perfect for every day.</p>
</div>
</article>


<h3>Related</h3>
<section className="grid">
{/* show related items from the DB */}
{(await prisma.product.findMany({ where: { NOT: { id: product.id } }, orderBy: { createdAt: "desc" }, take: 3 })).map((p) => (
	<ProductCard key={p.id} product={p} />
))}
</section>
</>
);
}