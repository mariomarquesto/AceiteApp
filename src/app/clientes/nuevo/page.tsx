"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevoCliente() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    permite_cuenta_corriente: false,
    limite_credito: 0
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      router.push("/clientes");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>Nuevo cliente</h1>

      <form onSubmit={guardar} style={{
        background: "white",
        padding: 24,
        borderRadius: 10,
        maxWidth: 500,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
      }}>
        {error && (
          <div style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: 12,
            borderRadius: 6,
            marginBottom: 16,
            fontSize: 14
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
            Nombre *
          </label>
          <input
            required
            className="input"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
            Teléfono
          </label>
          <input
            className="input"
            value={form.telefono}
            onChange={e => setForm({ ...form, telefono: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
            Email
          </label>
          <input
            type="email"
            className="input"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={form.permite_cuenta_corriente}
              onChange={e => setForm({ ...form, permite_cuenta_corriente: e.target.checked })}
            />
            Permite cuenta corriente
          </label>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/clientes")}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
