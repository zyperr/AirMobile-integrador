import { useState } from "react";

export default function Product() {
  const [condicion, setCondicion] = useState("nuevo");
  const [capacidad, setCapacidad] = useState("128");
  const [carrito, setCarrito] = useState([]);

  const agregarAlCarrito = () => {
    const producto = {
      nombre: "iPhone 13 Pro",
      capacidad,
      condicion
    };
    setCarrito([...carrito, producto]);
  };

  return (
    <div style={{ background: "#f5f5f7", minHeight: "100vh", padding: "60px" }}>

      {/* HERO */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "60px",
        alignItems: "center"
      }}>

        <div style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "40px",
          display: "flex",
          justifyContent: "center"
        }}>
          <img
            src="https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-13-pro-family-hero"
            style={{ width: "320px" }}
          />
        </div>

        <div>
          <span style={badge}>RESTAURADO CERTIFICADO</span>
          <h1 style={title}>iPhone 13 Pro</h1>

          <div style={{ display: "flex", gap: "10px" }}>
            <span style={price}>$849.00</span>
            <span style={oldPrice}>$999.00</span>
          </div>

          {/* CONDICIÓN */}
          <p style={label}>CONDICIÓN</p>
          <div style={row}>
            <button
              onClick={() => setCondicion("nuevo")}
              style={condicion === "nuevo" ? btnSelected : btnDefault}
            >
              Como nuevo
            </button>

            <button
              onClick={() => setCondicion("usado")}
              style={condicion === "usado" ? btnSelected : btnDefault}
            >
              Usado
            </button>
          </div>

          {/* CAPACIDAD */}
          <p style={label}>CAPACIDAD</p>
          <div style={row}>
            {["128", "256", "512"].map(c => (
              <button
                key={c}
                onClick={() => setCapacidad(c)}
                style={capacidad === c ? btnSelected : btnDefault}
              >
                {c}GB
              </button>
            ))}
          </div>

          {/* BOTÓN */}
          <button style={buyBtn} onClick={agregarAlCarrito}>
            Añadir al carrito
          </button>

          <p style={{ textAlign: "center", fontSize: "12px", color: "#777" }}>
            Envío gratuito y devoluciones en 30 días.
          </p>
        </div>
      </div>

      {/* BENEFICIOS */}
      <div style={benefitsBox}>
        {[
          ["Garantía de 12 meses", "Cobertura total"],
          ["+90% batería", "Baterías originales"],
          ["Inspección de 40 puntos", "Pruebas completas"],
          ["Pago seguro", "Pago cifrado"]
        ].map((b, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <h4>{b[0]}</h4>
            <p style={{ color: "#666" }}>{b[1]}</p>
          </div>
        ))}
      </div>

      {/* DESTREZA */}
      <div style={{
        maxWidth: "1200px",
        margin: "80px auto",
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "20px"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          background: "#eee",
          borderRadius: "20px"
        }}>
          <div style={{ padding: "30px" }}>
            <h2>Destreza técnica</h2>
            <p>Display Super Retina XDR</p>
            <p>Cámara Pro</p>
            <p>Chip A15 Bionic</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img
              src="https://m.media-amazon.com/images/I/51C7hGvpgEL._AC_SX466_.jpg"
              style={{ width: "150px", opacity: 0.6 }}
            />
          </div>
        </div>

        <div style={{
          background: "#eee",
          borderRadius: "20px",
          padding: "30px",
          textAlign: "center"
        }}>
          <h3>Indicador de estado</h3>
          <p>Este dispositivo tiene una valoración de 9.8/10</p>
        </div>
      </div>

      {/* PRODUCTOS */}
      <div style={{ maxWidth: "1200px", margin: "80px auto" }}>
        <h2>Combinaciones perfectas</h2>

        <div style={productsGrid}>
          {[
            { name: "MagSafe Case", img: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MHXH3" },
            { name: "Cargador USB-C", img: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MU7V2" },
            { name: "AirPods Pro", img: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MQD83" },
            { name: "Protector Glass", img: "https://acdn-us.mitiendanube.com/stores/003/480/832/products/img_83991-bd583b1599b616e08e16920418477310-1024-1024.webp" },
          ].map((p, i) => (
            <div key={i} style={productCard}>
              <img src={p.img} style={{ width: "120px" }} />
              <p style={{ margin: "10px 0" }}>{p.name}</p>
              <button style={{ ...btnDefault, marginTop: "auto" }}>
                Añadir al carrito
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        background: "#fff",
        borderTop: "1px solid #eee",
        padding: "20px"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between"
        }}>
          <h2>AirMobile</h2>

          <div style={{ display: "flex", gap: "20px" }}>
            <span style={{ color: "#2563eb" }}>iPhones</span>
            <span>Fundas</span>
            <span>Cargadores</span>
            <span>Audio</span>
          </div>

          <div>🛒 {carrito.length}</div>
        </div>
      </div>

    </div>
  );
}

/* ESTILOS */

const badge = {
  background: "#dbeafe",
  color: "#2563eb",
  padding: "6px 12px",
  borderRadius: "20px"
};

const title = { fontSize: "40px" };
const price = { fontSize: "24px" };
const oldPrice = { textDecoration: "line-through" };

const label = { marginTop: "20px" };
const row = { display: "flex", gap: "10px" };

const btnDefault = {
  padding: "10px 16px",
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: "10px",
  cursor: "pointer"
};

const btnSelected = {
  padding: "10px 16px",
  background: "#fff",
  border: "2px solid #2563eb",
  borderRadius: "10px",
  cursor: "pointer"
};

const buyBtn = {
  marginTop: "30px",
  width: "100%",
  padding: "16px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer"
};

const benefitsBox = {
  margin: "80px auto",
  maxWidth: "1200px",
  display: "grid",
  gridTemplateColumns: "repeat(4,1fr)",
  gap: "20px",
  background: "#eee",
  padding: "40px",
  borderRadius: "20px"
};

const productsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4,1fr)",
  gap: "20px"
};

const productCard = {
  background: "#fff",
  padding: "20px",
  borderRadius: "20px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  height: "100%"
};