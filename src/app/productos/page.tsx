async function fetchProductos() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(base + "/api/productos", { cache: "no-store" });
  const json = await res.json();
  return json.data || [];
}

const tipoLabel: Record<string, string> = {
  aceite: "🛢️ Aceite",
  filtro: "🔧 Filtro",
  repuesto: "⚙️ Repuesto",
  insumo: "📦 Insumo"
};

export default async function ProductosPage() {
  const productos = await fetchProductos();

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>Productos</h1>

      <table className="table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Marca</th>
            <th>Stock</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p: any) => {
            const stockBajo = p.stock <= p.stock_minimo;
            return (
              <tr key={p.id}>
                <td style={{ color: "#64748b", fontSize: 13 }}>{p.codigo || "-"}</td>
                <td style={{ fontWeight: 500 }}>{p.nombre}</td>
                <td>{tipoLabel[p.tipo] || p.tipo}</td>
                <td style={{ color: "#64748b" }}>{p.marca || "-"}</td>
                <td style={{ fontWeight: 600, color: stockBajo ? "#ef4444" : "#16a34a" }}>
                  {p.stock}
                </td>
                <td style={{ fontWeight: 500 }}>
                  {"$" + Number(p.precio_venta).toLocaleString("es-AR")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
