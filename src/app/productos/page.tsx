import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getProductos() {
  const { data } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("nombre");
  return data || [];
}

const tipoInfo: Record<string, { label: string; color: string; icon: string }> = {
  aceite: { label: "Aceite", color: "#f59e0b", icon: "🛢️" },
  filtro: { label: "Filtro", color: "#0ea5e9", icon: "🔧" },
  repuesto: { label: "Repuesto", color: "#8b5cf6", icon: "⚙️" },
  insumo: { label: "Insumo", color: "#64748b", icon: "📦" }
};

export default async function ProductosPage() {
  const productos = await getProductos();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Productos</h1>
          <div className="page-subtitle">
            {productos.length} {productos.length === 1 ? "producto" : "productos"} en inventario
          </div>
        </div>
        <Link href="/productos/nuevo" className="btn btn-primary">+ Nuevo producto</Link>
      </div>

      {productos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#475569", marginBottom: 6 }}>No hay productos</div>
          <Link href="/productos/nuevo" className="btn btn-primary">+ Nuevo producto</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Marca</th>
                <th>Stock</th>
                <th style={{ textAlign: "right" }}>Precio</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p: any) => {
                const stockBajo = p.stock <= p.stock_minimo;
                const info = tipoInfo[p.tipo] || tipoInfo.insumo;
                return (
                  <tr key={p.id}>
                    <td>
                      <Link href={"/productos/" + p.id} style={{ fontWeight: 600, color: "#0f172a", textDecoration: "none" }}>
                        {p.nombre}
                      </Link>
                      {p.codigo && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{p.codigo}</div>}
                    </td>
                    <td>
                      <span className="badge" style={{ background: info.color + "15", color: info.color }}>
                        {info.icon} {info.label}
                      </span>
                    </td>
                    <td style={{ color: "#64748b" }}>{p.marca || "—"}</td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, color: stockBajo ? "#ef4444" : "#16a34a" }}>
                        {stockBajo && "⚠️"}{p.stock}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{"$" + Number(p.precio_venta).toLocaleString("es-AR")}</td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={"/productos/" + p.id} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 13 }}>✏️ Editar</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
