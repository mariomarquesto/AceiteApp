"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ContactoBoton from "@/app/components/ContactoBoton";

export default function EditarCliente() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [ultimoContacto, setUltimoContacto] = useState<any>(null);
  const [totalContactos, setTotalContactos] = useState(0);

  useEffect(() => {
    fetch("/api/clientes/" + id)
      .then(r => r.json())
      .then(j => {
        setForm(j.data);
        setVehiculos(j.data?.vehiculos || []);
        setCargando(false);
      })
      .catch(() => {
        setError("Error al cargar el cliente");
        setCargando(false);
      });
  }, [id]);

  useEffect(() => {
    fetch("/api/contactos?cliente_id=" + id + "&limit=10")
      .then(r => r.json())
      .then(j => {
        const data = j.data || [];
        setTotalContactos(data.length);
        if (data.length > 0) setUltimoContacto(data[0]);
      })
      .catch(() => {});
  }, [id]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setExito(false);

    try {
      const res = await fetch("/api/clientes/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          telefono: form.telefono || null,
          email: form.email || null,
          direccion: form.direccion || null,
          notas: form.notas || null,
          permite_cuenta_corriente: form.permite_cuenta_corriente,
          limite_credito: Number(form.limite_credito) || 0
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      setExito(true);
      setTimeout(() => setExito(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!confirm("¿Eliminar este cliente? No se puede deshacer.")) return;
    setEliminando(true);
    setError("");

    try {
      const res = await fetch("/api/clientes/" + id, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      router.push("/clientes");
    } catch (e: any) {
      setError(e.message);
      setEliminando(false);
    }
  }

  function enviarPortalWhatsApp() {
    if (!form?.telefono || !form?.portal_token) return;
    const tel = form.telefono.replace(/[^0-9]/g, "");
    const base = window.location.origin;
    const link = base + "/portal/" + form.portal_token;
    const mensaje = encodeURIComponent(
      "Hola " + form.nombre + "! 👋\n\n" +
      "Te paso el link de tu *portal de cliente* en ARN Lubricentro.\n\n" +
      "Ahí podés ver:\n" +
      "🚗 Tus vehículos y próximos cambios\n" +
      "📋 Historial de services\n" +
      "💰 Tu saldo\n" +
      "📅 Próximos turnos\n\n" +
      "🔗 " + link + "\n\n" +
      "¡Cualquier cosa avisame!"
    );
    window.open("https://wa.me/" + (tel.startsWith("54") ? tel : "54" + tel) + "?text=" + mensaje, "_blank");
  }

  if (cargando) return <div>Cargando...</div>;
  if (!form) return <div>Cliente no encontrado</div>;

  const resultadoInfo: Record<string, { label: string; color: string }> = {
    sin_respuesta: { label: "Sin respuesta", color: "#64748b" },
    contactado: { label: "Contactado", color: "#0ea5e9" },
    interesado: { label: "Interesado", color: "#8b5cf6" },
    agendo: { label: "Agendó turno", color: "#16a34a" },
    rechazo: { label: "Rechazó", color: "#ef4444" }
  };

  const tipoIcono: Record<string, string> = {
    whatsapp: "📱",
    llamada: "📞",
    email: "📧",
    visita: "🚗",
    sms: "💬"
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Editar cliente</h1>
          <div className="page-subtitle">{form.nombre}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/clientes" className="btn btn-secondary">
            ← Volver
          </Link>
          {form.portal_token && (
            <a
              href={"/portal/" + form.portal_token}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)",
                color: "white",
                fontWeight: 700
              }}
            >
              🔗 Ver portal
            </a>
          )}
          {form.telefono && form.portal_token && (
            <button
              onClick={enviarPortalWhatsApp}
              className="btn"
              style={{
                background: "linear-gradient(135deg, #25d366, #128c7e)",
                color: "white",
                fontWeight: 700
              }}
            >
              📱 Enviar portal
            </button>
          )}
          <Link href={"/clientes/" + id + "/nuevo-vehiculo"} className="btn btn-primary">
            + Nuevo vehículo
          </Link>
          <button onClick={eliminar} disabled={eliminando} className="btn btn-danger">
            {eliminando ? "..." : "🗑️ Eliminar"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 18, fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {exito && (
        <div style={{ background: "#dcfce7", color: "#166534", padding: 12, borderRadius: 8, marginBottom: 18, fontWeight: 500 }}>
          ✅ Cambios guardados correctamente
        </div>
      )}

      {/* Card de historial de contacto */}
      <div className="form-card" style={{ maxWidth: 640, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>📞 Historial de contacto</h2>
          <ContactoBoton
            clienteId={id}
            clienteNombre={form?.nombre}
            motivo="Seguimiento"
          />
        </div>

        {ultimoContacto ? (
          <>
            <div style={{ background: "#f0f9ff", padding: 12, borderRadius: 8, marginBottom: 8, border: "1px solid #bae6fd" }}>
              <div style={{ fontSize: 12, color: "#0369a1", fontWeight: 600, marginBottom: 6 }}>
                Último contacto
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14 }}>
                  {tipoIcono[ultimoContacto.tipo] || "📝"}{" "}
                  {ultimoContacto.tipo.charAt(0).toUpperCase() + ultimoContacto.tipo.slice(1)}
                </span>
                <span style={{ color: "#cbd5e1" }}>·</span>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  {new Date(ultimoContacto.fecha).toLocaleDateString("es-AR")}
                </span>
                <span style={{ color: "#cbd5e1" }}>·</span>
                <span className="badge" style={{
                  background: (resultadoInfo[ultimoContacto.resultado]?.color || "#64748b") + "20",
                  color: resultadoInfo[ultimoContacto.resultado]?.color || "#64748b",
                  fontSize: 11,
                  padding: "3px 8px"
                }}>
                  {resultadoInfo[ultimoContacto.resultado]?.label || ultimoContacto.resultado}
                </span>
              </div>
              {ultimoContacto.notas && (
                <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic", marginTop: 6 }}>
                  "{ultimoContacto.notas}"
                </div>
              )}
            </div>

            {totalContactos > 1 && (
              <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
                {totalContactos} contactos registrados en total
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 16, color: "#94a3b8", fontSize: 13 }}>
            Sin contactos registrados aún. Hacé click en "📝 Registrar contacto".
          </div>
        )}
      </div>

      {/* Formulario de edición */}
      <form onSubmit={guardar} className="form-card" style={{ maxWidth: 640, marginBottom: 24 }}>
        <div className="form-group">
          <label className="form-label">Nombre completo *</label>
          <input
            required
            className="input"
            value={form.nombre || ""}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input
              className="input"
              value={form.telefono || ""}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="input"
              value={form.email || ""}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Dirección</label>
          <input
            className="input"
            value={form.direccion || ""}
            onChange={e => setForm({ ...form, direccion: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notas</label>
          <textarea
            className="input"
            rows={2}
            value={form.notas || ""}
            onChange={e => setForm({ ...form, notas: e.target.value })}
            placeholder="Notas internas sobre el cliente..."
          />
        </div>

        <div style={{ background: "#f8fafc", padding: 16, borderRadius: 10, marginBottom: 20, border: "1px solid #e2e8f0" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.permite_cuenta_corriente || false}
              onChange={e => setForm({ ...form, permite_cuenta_corriente: e.target.checked })}
              style={{ width: 18, height: 18, cursor: "pointer" }}
            />
            Habilitar cuenta corriente
          </label>

          {form.permite_cuenta_corriente && (
            <div style={{ marginTop: 14 }}>
              <label className="form-label">Límite de crédito</label>
              <input
                type="number"
                className="input"
                value={form.limite_credito || 0}
                onChange={e => setForm({ ...form, limite_credito: e.target.value })}
              />
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? "Guardando..." : "Guardar cambios"}
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

      {/* Vehículos del cliente */}
      {vehiculos.length > 0 && (
        <div className="form-card">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            🚗 Vehículos del cliente ({vehiculos.length})
          </h2>
          <div className="table-wrapper" style={{ boxShadow: "none" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Vehículo</th>
                  <th>Patente</th>
                  <th>Km actual</th>
                  <th>Tipo de uso</th>
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vehiculos.map((v: any) => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 600 }}>{v.marca} {v.modelo}</td>
                    <td style={{ color: "#64748b" }}>{v.placa || "—"}</td>
                    <td>{Number(v.km_actual).toLocaleString("es-AR")}</td>
                    <td>
                      <span className="badge" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                        {v.tipo_uso || "particular"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={"/vehiculos/" + v.id} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 13 }}>
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}