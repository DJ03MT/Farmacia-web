import { useEffect, useState } from 'react';
import './App.css';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  fecha_vencimiento: Date | string | null;
  imagenUrl: string;
}

function App() {
  const [productos, setProductos] = useState<Producto[]>([]);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState(''); 
  const [stock, setStock] = useState('');
  const [fecha_vencimiento, setFecha_vencimiento] = useState('');

  const cargarProductos = () => {
    fetch('http://localhost:3000/productos')
      .then(response => response.json())
      .then(data => setProductos(data))
      .catch(err => console.error('Error al cargar productos:', err));
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const guardarProducto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nuevoProducto = {
      nombre,
      descripcion,
      precio: parseFloat(precio), 
      stock: parseInt(stock),     
      fecha_vencimiento: fecha_vencimiento || null,
      imagenUrl: 'https://via.placeholder.com/280x180?text=Medicamento'
    };

    try {
      const respuesta = await fetch('http://localhost:3000/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoProducto)
      });

      if (respuesta.ok) {
        alert('¡Producto guardado con éxito!');
        setNombre('');
        setDescripcion('');
        setPrecio(''); 
        setStock(''); 
        setFecha_vencimiento('');
        cargarProductos();
      } else {
        alert('Error al guardar el producto');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión al servidor');
    }
  };

  const formatearFecha = (fecha: string | Date | null) => {
    if (!fecha) return 'Fecha No disponible';
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) return 'Fecha inválida';
    return fechaObj.getUTCDate() + '/' + (fechaObj.getUTCMonth() + 1) + '/' + fechaObj.getUTCFullYear();
  };

  return (
    <div className="main-container">
      <header className="saba-header">
        <h1>Farmacia Saba</h1>
        <span>Catálogo Digital</span>
      </header>

      <div className="form-container">
        <h2 style={{ color: '#e11d48', marginBottom: '20px', textAlign: 'center' }}>Agregar Nuevo Medicamento</h2>
        
        <form onSubmit={guardarProducto} className="form-grid">
          
          <div className="input-group">
            <label>Nombre del Producto:</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              required 
              placeholder="Ej: Aspirina Forte"
            />
          </div>

          <div className="input-group">
            <label>Precio (C$):</label>
            <input 
              type="number" 
              step="0.01" 
              value={precio} 
              onChange={(e) => setPrecio(e.target.value)} 
              required 
              placeholder="0.00"
            />
          </div>

          <div className="input-group">
            <label>Stock Disponible:</label>
            <input 
              type="number" 
              value={stock} 
              onChange={(e) => setStock(e.target.value)} 
              required 
              placeholder="0"
            />
          </div>

          <div className="input-group">
            <label>Fecha Vencimiento:</label>
            <input 
              type="date" 
              value={fecha_vencimiento} 
              onChange={(e) => setFecha_vencimiento(e.target.value)} 
            />
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label>Descripción:</label>
            <textarea 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)} 
              rows={3}
              placeholder="Detalles del medicamento..."
            />
          </div>

          <button type="submit" className="btn-submit">
            GUARDAR PRODUCTO
          </button>

        </form>
      </div>
      
      <div className="products-grid">
        {productos.map((prod) => (
          <div key={prod.id} className="product-card">
            <img 
              src={prod.imagenUrl} 
              alt={prod.nombre} 
              className="product-image" 
              onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/280x180?text=Medicamento'}
            />

            <div className="product-details">
              <h3>{prod.nombre}</h3>
              <p className="product-description">{prod.descripcion || 'Sin descripción disponible.'}</p>
              <p style={{ fontSize: '0.8rem', color: '#777', marginBottom: '10px' }}>
                Vence: <strong>{formatearFecha(prod.fecha_vencimiento)}</strong>
              </p>

              <div className="product-footer">
                <span className="product-price">C$ {Number(prod.precio).toFixed(2)}</span>
                
                <span className={`stock-badge ${prod.stock > 0 ? '' : 'out-of-stock'}`}>
                  {prod.stock > 0 ? `${prod.stock} disponibles` : 'Agotado'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {productos.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#777' }}>
          <p>No hay productos registrados en el catálogo.</p>
        </div>
      )}
    </div>
  );
}

export default App;