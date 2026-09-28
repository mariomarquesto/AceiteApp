const fs = require("fs");
let css = fs.readFileSync("src/app/globals.css", "utf8");

if (!css.includes(".dashboard-columns")) {
  css += `

/* Columnas del dashboard (responsive) */
.dashboard-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 900px) {
  .dashboard-columns {
    grid-template-columns: 1fr;
  }
}
`;
  fs.writeFileSync("src/app/globals.css", css, "utf8");
  console.log("OK: CSS dashboard-columns agregado");
} else {
  console.log("Ya estaba");
}
