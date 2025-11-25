"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function OrderConfirmation() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!orderId) return;
      try {
        const res = await fetch(`/api/orders?orderId=${orderId}`);
        if (!res.ok) return;
        const json = await res.json();
        if (!ignore) setOrder(json.order);
      } catch (err) {}
    }
    load();
    return () => { ignore = true; };
  }, [orderId]);

  if (!orderId) return <section style={{padding:16}}><p>No order specified.</p></section>;

  return (
    <section style={{padding:16, maxWidth:700, margin:"0 auto"}}>
      <h2>Order Confirmation</h2>
      <p>Order ID: <strong>{orderId}</strong></p>
      {order ? (
        <div>
          <p>Status: {order.status}</p>
          <p>Total: ₹{order.total}</p>
          <div>
            <h4>Items</h4>
            <ul style={{listStyle:'none', padding:0}}>
              {order.items.map(it=> (
                <li key={it.id}>{it.name} × {it.qty} — ₹{it.price * it.qty}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p>Loading order…</p>
      )}
    </section>
  );
}
