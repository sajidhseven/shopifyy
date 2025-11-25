"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PlaceOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/cart", { method: "GET", cache: "no-store" });
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const json = await res.json();
        if (!ignore) {
          setItems(json.items || []);
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to load cart");
        setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [router]);

  const total = items.reduce((s,i) => s + (i.product?.price || 0) * i.qty, 0);

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setProcessing(true);
    setError("");

    if (!fullName || !address || !phone) {
      setError("Please fill name, address and phone");
      setProcessing(false);
      return;
    }

    try {
      // create order server-side (PENDING)
      const createRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, address, phone }),
      });

      if (!createRes.ok) {
        const d = await createRes.json().catch(()=>({}));
        throw new Error(d.error || "Failed to create order");
      }

      const createJson = await createRes.json();
      const orderId = createJson.orderId;

      // simulate payment via dummy gateway
      const payRes = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, amount: total }),
      });

      if (!payRes.ok) {
        const d = await payRes.json().catch(()=>({}));
        throw new Error(d.error || "Payment failed");
      }

      const payJson = await payRes.json();
      if (payJson.status !== "success") {
        throw new Error("Payment failed");
      }

      // success -> redirect to confirmation
      router.push(`/orders/confirmation?orderId=${orderId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Order failed");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <section style={{padding:16}}><p>Loading…</p></section>;

  if (items.length === 0) return <section style={{padding:16}}><h2>Your cart is empty</h2></section>;

  return (
    <section style={{padding:16, maxWidth:700, margin:"0 auto"}}>
      <h2>Place Order</h2>

      <div style={{marginBottom:16}}>
        <strong>Items</strong>
        <ul style={{listStyle:'none', padding:0}}>
          {items.map(it => (
            <li key={it.id} style={{borderBottom:'1px solid #eee', padding:'8px 0'}}>
              {it.product?.name} × {it.qty} — ₹{(it.product?.price||0)*it.qty}
            </li>
          ))}
        </ul>
        <div style={{marginTop:8}}>Total: <strong>₹{total}</strong></div>
      </div>

      <form onSubmit={handlePlaceOrder} style={{display:'grid', gap:10}}>
        <label>
          Full name
          <input value={fullName} onChange={e=>setFullName(e.target.value)} style={{width:'100%', padding:8, marginTop:6}} />
        </label>

        <label>
          Address
          <textarea value={address} onChange={e=>setAddress(e.target.value)} style={{width:'100%', padding:8, marginTop:6}} />
        </label>

        <label>
          Phone
          <input value={phone} onChange={e=>setPhone(e.target.value)} style={{width:'100%', padding:8, marginTop:6}} />
        </label>

        {error && <div style={{color:'#c00', background:'#fff5f5', padding:8, borderRadius:6}}>{error}</div>}

        <button type="submit" disabled={processing} style={{padding:'12px 16px', background:'#111', color:'#fff', borderRadius:8}}>
          {processing ? 'Processing…' : `Pay ₹${total} (mock)`}
        </button>
      </form>
    </section>
  );
}
