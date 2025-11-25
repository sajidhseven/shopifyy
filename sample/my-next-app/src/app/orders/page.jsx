"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch('/api/orders', { method: 'GET', cache: 'no-store' });
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          const d = await res.json().catch(()=>({}));
          throw new Error(d.error || 'Failed to load orders');
        }
        const json = await res.json();
        if (!ignore) {
          setOrders(json.orders || []);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) setError(err.message || 'Failed to load orders');
        setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [router]);

  if (loading) return <section style={{padding:16}}><p>Loading orders…</p></section>;
  if (error) return <section style={{padding:16}}><p style={{color:'#c00'}}>{error}</p></section>;

  return (
    <section style={{padding:16, maxWidth:900, margin:'0 auto'}}>
      <h2 style={{marginTop:0}}>Your Orders</h2>
      {orders.length === 0 ? (
        <p>You have not placed any orders yet.</p>
      ) : (
        <ul style={{listStyle:'none', padding:0, display:'grid', gap:12}}>
          {orders.map(order => (
            <li key={order.id} style={{border:'1px solid #eee', borderRadius:12, padding:12, background:'#fff'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:600}}>Order #{order.id}</div>
                  <div style={{color:'#666', fontSize:13}}>{new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontWeight:700}}>₹{order.total}</div>
                  <div style={{fontSize:13, color:'#666'}}>{order.status}</div>
                </div>
              </div>

              <div style={{marginTop:8}}>
                <strong>Items</strong>
                <ul style={{listStyle:'none', padding:0, margin:0}}>
                  {order.items.map(it => (
                    <li key={it.id} style={{padding:'6px 0', borderBottom:'1px solid #f4f4f4'}}>
                      {it.name} × {it.qty} — ₹{it.price * it.qty}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{marginTop:12, display:'flex', gap:8}}>
                <button onClick={()=>router.push(`/orders/confirmation?orderId=${order.id}`)} style={{padding:'8px 12px', borderRadius:8, border:'1px solid #111', background:'#111', color:'#fff'}}>View</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
