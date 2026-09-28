const fs = require("fs");
let css = fs.readFileSync("src/app/globals.css", "utf8");

if (!css.includes(".navbar-search-wrapper")) {
  css += `

/* Wrapper de la búsqueda global */
.navbar-search-wrapper {
  width: 240px;
  flex-shrink: 0;
  margin-left: 8px;
  margin-right: 8px;
}

@media (max-width: 1400px) {
  .navbar-search-wrapper {
    width: 180px;
  }
}

@media (max-width: 1200px) {
  .navbar-search-wrapper {
    display: none;
  }
}
`;
  fs.writeFileSync("src/app/globals.css", css, "utf8");
  console.log("OK: CSS del navbar-search-wrapper agregado");
} else {
  console.log("Ya estaba");
}
