import { useEffect, useState } from 'react';
import './App.css';
import { Search, ShoppingCart, CreditCard, Banknote, Trash2, Printer, Store, Package, RefreshCw, X, Plus, Pencil, History } from 'lucide-react'; // <--- Agregamos Pencil

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  fecha_vencimiento: string | null;
  imagenUrl: string;
}

interface ItemCarrito extends Producto {
  cantidadVenta: number;
}

function App() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroStock, setFiltroStock] = useState(false);

  // Estados Modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TARJETA'>('EFECTIVO');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [factura, setFactura] = useState<any | null>(null);

  // === ESTADOS PARA PRODUCTO (CREAR Y EDITAR) ===
  const [modalProducto, setModalProducto] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState<number | null>(null); // ID del producto a editar (null si es nuevo)

  // Campos del formulario
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevoStock, setNuevoStock] = useState('');
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaImagen, setNuevaImagen] = useState('');

  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [listaVentas, setListaVentas] = useState<any[]>([]);

  const cargarProductos = () => {
    fetch('http://localhost:3000/productos')
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error("Error:", err));
  };

  const cargarHistorial = async () => {
    try {
      const res = await fetch('http://localhost:3000/ventas');
      const data = await res.json();
      setListaVentas(data);
      setMostrarHistorial(true);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { cargarProductos(); }, []);

  // --- ABRIR MODAL PARA CREAR ---
  const abrirModalNuevo = () => {
    setProductoAEditar(null); // Modo Crear
    setNuevoNombre(''); setNuevoPrecio(''); setNuevoStock(''); setNuevaDesc(''); setNuevaFecha('');
    setModalProducto(true);
  };

  // --- ABRIR MODAL PARA EDITAR ---
  const abrirModalEditar = (prod: Producto, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se agregue al carrito al hacer clic
    setProductoAEditar(prod.id); // Modo Editar
    setNuevoNombre(prod.nombre);
    setNuevoPrecio(prod.precio.toString());
    setNuevoStock(prod.stock.toString());
    setNuevaDesc(prod.descripcion);
    // Formatear fecha para el input date (YYYY-MM-DD)
    setNuevaFecha(prod.fecha_vencimiento ? prod.fecha_vencimiento.split('T')[0] : '');
    setModalProducto(true);
  };

  // --- GUARDAR (CREAR O ACTUALIZAR) ---
  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    const productoPayload = {
      nombre: nuevoNombre,
      descripcion: nuevaDesc,
      precio: parseFloat(nuevoPrecio),
      stock: parseInt(nuevoStock),
      fecha_vencimiento: nuevaFecha || null,
      imagenUrl: nuevaImagen || 'https://via.placeholder.com/150?text=Med'
    };

    try {
      let url = 'http://localhost:3000/productos';
      let method = 'POST';

      // Si estamos editando, cambiamos la URL y el método
      if (productoAEditar) {
        url = `http://localhost:3000/productos/${productoAEditar}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productoPayload)
      });

      if (res.ok) {
        alert(productoAEditar ? "Producto actualizado" : "Producto creado");
        setModalProducto(false);
        cargarProductos();
      } else {
        alert("Error al guardar");
      }
    } catch (error) { alert("Error de conexión"); }
  };

  // --- ELIMINAR PRODUCTO ---
  const eliminarProducto = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
    try {
      await fetch(`http://localhost:3000/productos/${id}`, { method: 'DELETE' });
      cargarProductos();
    } catch (error) { alert("Error al eliminar"); }
  };

  // --- LÓGICA POS ---
  const productosFiltrados = productos.filter(prod => {
    const coincideTexto = prod.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideStock = filtroStock ? prod.stock > 0 : true;
    return coincideTexto && coincideStock;
  });

  const agregarAlCarrito = (producto: Producto) => {
    if (producto.stock === 0) return alert("Producto agotado");
    const existe = carrito.find(item => item.id === producto.id);
    if (existe && existe.cantidadVenta + 1 > producto.stock) return alert("Stock insuficiente");

    if (existe) {
      setCarrito(carrito.map(item => item.id === producto.id ? { ...item, cantidadVenta: item.cantidadVenta + 1 } : item));
    } else {
      setCarrito([...carrito, { ...producto, cantidadVenta: 1 }]);
    }
  };

  const quitarDelCarrito = (id: number) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const calcularTotal = () => carrito.reduce((total, item) => total + (item.precio * item.cantidadVenta), 0);

  const procesarVenta = async () => {
    const total = calcularTotal();
    const pagoCliente = parseFloat(montoRecibido);
    if (metodoPago === 'EFECTIVO' && (isNaN(pagoCliente) || pagoCliente < total)) return alert("Monto insuficiente");

    try {
      const res = await fetch('http://localhost:3000/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metodo_pago: metodoPago,
          productos: carrito.map(item => ({ id: item.id, cantidad: item.cantidadVenta }))
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFactura({
          id: data.id || Date.now(),
          fecha: new Date().toLocaleString(),
          items: [...carrito],
          total: total,
          metodo: metodoPago,
          recibido: metodoPago === 'EFECTIVO' ? pagoCliente : total,
          cambio: metodoPago === 'EFECTIVO' ? pagoCliente - total : 0
        });
        setCarrito([]); setModalAbierto(false); setMontoRecibido(''); cargarProductos();
      }
    } catch (error) { alert("Error venta"); }
  };

  return (
    <div className="pos-container">
      {/* SECCIÓN CATÁLOGO */}
      <div className="catalog-section">
        <div className="header-catalog">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Store size={28} color="#0f766e" />
            <div><h2 style={{ margin: 0 }}>Farmacia POS</h2></div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-add" onClick={abrirModalNuevo}>
              <Plus size={18} /> Nuevo
            </button>
            <button onClick={cargarProductos} className="btn-icon" title="Recargar"><RefreshCw size={20} /></button>
            <button onClick={cargarHistorial} className="btn-icon" title="Historial"><History size={20} /></button>
          </div>
        </div>

        <div className="search-bar-container">
          <div className="input-with-icon" style={{ position: 'relative', flexGrow: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '15px', top: '12px', color: '#94a3b8' }} />
            <input type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          <button onClick={() => setFiltroStock(!filtroStock)} style={{
            background: filtroStock ? '#0f766e' : 'white',
            color: filtroStock ? 'white' : '#64748b',
            border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
          }}>
            <Package size={18} /> {filtroStock ? 'Stock' : 'Todos'}
          </button>
        </div>

        <div className="products-grid">
          {productosFiltrados.map((prod) => (
            <div key={prod.id} className="product-card" onClick={() => agregarAlCarrito(prod)} style={{ opacity: prod.stock === 0 ? 0.6 : 1, position: 'relative' }}>
              {/* BOTONES FLOTANTES DE EDICIÓN */}
              <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px', zIndex: 10 }}>
                <button onClick={(e) => abrirModalEditar(prod, e)} style={{ background: 'white', border: '1px solid #ddd', padding: '5px', borderRadius: '4px', cursor: 'pointer', color: '#0f766e' }}>
                  <Pencil size={14} />
                </button>
                <button onClick={(e) => eliminarProducto(prod.id, e)} style={{ background: 'white', border: '1px solid #ddd', padding: '5px', borderRadius: '4px', cursor: 'pointer', color: '#ef4444' }}>
                  <Trash2 size={14} />
                </button>
              </div>

              {prod.stock === 0 && <span className="badge-agotado">AGOTADO</span>}
              <img src={prod.imagenUrl} onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/150?text=Med'} />
              <h3>{prod.nombre}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="price">C$ {Number(prod.precio).toFixed(2)}</span>
                <span className={`stock ${prod.stock < 10 ? 'low' : ''}`}>{prod.stock} u.</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN TICKET */}
      <div className="ticket-section">
        <div className="ticket-header"><h3><ShoppingCart size={20} /> Venta</h3></div>
        <div className="ticket-items">
          {carrito.length === 0 ? (
            <div className="empty-state"><ShoppingCart size={48} color="#cbd5e1" /><p>Carrito vacío</p></div>
          ) : (
            carrito.map(item => (
              <div key={item.id} className="ticket-item">
                <div><h4>{item.nombre}</h4><span>{item.cantidadVenta} x C${item.precio}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <strong>C$ {(item.cantidadVenta * item.precio).toFixed(2)}</strong>
                  <button className="btn-remove" onClick={(e) => { e.stopPropagation(); quitarDelCarrito(item.id); }}><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="ticket-footer">
          <div className="total-row"><span>Total:</span><span>C$ {calcularTotal().toFixed(2)}</span></div>
          <button className="btn-pay" onClick={() => setModalAbierto(true)} disabled={carrito.length === 0}>COBRAR</button>
        </div>
      </div>

      {/* MODAL PRODUCTO (CREAR / EDITAR) */}
      {modalProducto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              {/* Título dinámico */}
              <h2>{productoAEditar ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setModalProducto(false)} className="btn-close"><X size={24} /></button>
            </div>
            <form onSubmit={guardarProducto} style={{ display: 'grid', gap: '15px' }}>
              <div className="input-group">
                <div className="input-group">
                  <label>URL de Imagen:</label>
                  <input
                    value={nuevaImagen}
                    onChange={e => setNuevaImagen(e.target.value)}
                    placeholder="https://..."
                  />
                  <small style={{ color: '#666', fontSize: '0.8rem' }}>Copia y pega el link de la imagen de Google</small>
                </div>
                <label>Nombre:</label>
                <input required value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} placeholder="Ej. Ibuprofeno" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-group">
                  <label>Precio:</label>
                  <input required type="number" step="0.01" value={nuevoPrecio} onChange={e => setNuevoPrecio(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Stock:</label>
                  <input required type="number" value={nuevoStock} onChange={e => setNuevoStock(e.target.value)} />
                </div>
              </div>
              <div className="input-group">
                <label>Vencimiento:</label>
                <input type="date" value={nuevaFecha} onChange={e => setNuevaFecha(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Descripción:</label>
                <input value={nuevaDesc} onChange={e => setNuevaDesc(e.target.value)} placeholder="Detalles..." />
              </div>
              <button type="submit" className="btn-confirm-pay">
                {productoAEditar ? 'ACTUALIZAR' : 'GUARDAR'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PAGO */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h2>Cobrar</h2><button onClick={() => setModalAbierto(false)} className="btn-close"><X /></button></div>
            <div className="payment-options">
              <button className={`pay-option ${metodoPago === 'EFECTIVO' ? 'active' : ''}`} onClick={() => setMetodoPago('EFECTIVO')}><Banknote size={32} />Efectivo</button>
              <button className={`pay-option ${metodoPago === 'TARJETA' ? 'active' : ''}`} onClick={() => setMetodoPago('TARJETA')}><CreditCard size={32} />Tarjeta</button>
            </div>
            <div className="payment-details">
              <div className="detail-row total"><span>Total:</span><span>C$ {calcularTotal().toFixed(2)}</span></div>
              {metodoPago === 'EFECTIVO' && (
                <>
                  <div className="input-group"><label>Recibido:</label><input type="number" autoFocus value={montoRecibido} onChange={e => setMontoRecibido(e.target.value)} /></div>
                  <div className="detail-row change"><span>Cambio:</span><span>C$ {(parseFloat(montoRecibido || '0') - calcularTotal()).toFixed(2)}</span></div>
                </>
              )}
            </div>
            <button className="btn-confirm-pay" onClick={procesarVenta}>CONFIRMAR</button>
          </div>
        </div>
      )}

      {/* TICKET FACTURA */}
      {factura && (
        <div className="modal-overlay">
          <div className="modal-content receipt">
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #444', paddingBottom: '15px', marginBottom: '15px' }}>
              <h2>FARMACIA SABA</h2>
              <p>RUC: J03100000000</p>
              <p>Managua, Nicaragua</p>
              <p>{factura.fecha}</p>
              <p><strong>Ticket #{factura.id}</strong></p>
            </div>
            <div className="receipt-items">
              {factura.items.map((it: any) => (
                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                  <span>{it.cantidadVenta} x {it.nombre}</span>
                  <span>C$ {(it.precio * it.cantidadVenta).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px dashed #444', paddingTop: '10px', marginTop: '10px' }}>
              <div className="detail-row total"><span>TOTAL:</span><span>C$ {factura.total.toFixed(2)}</span></div>
              <div className="detail-row"><span>Pago ({factura.metodo}):</span><span>C$ {factura.recibido.toFixed(2)}</span></div>
              <div className="detail-row"><span>Cambio:</span><span>C$ {factura.cambio.toFixed(2)}</span></div>
            </div>
            <div className="receipt-actions">
              <button className="btn-print" onClick={() => window.print()}><Printer size={20} /> Imprimir</button>
              <button className="btn-close-receipt" onClick={() => setFactura(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
      {/* === MODAL HISTORIAL === */}
      {mostrarHistorial && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>Historial de Ventas</h2>
              <button onClick={() => setMostrarHistorial(false)} className="btn-close"><X size={24} /></button>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th>Fecha</th>
                    <th>Método</th>
                    <th>Total</th>
                    <th>Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {listaVentas.map((venta) => (
                    <tr key={venta.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>#{venta.id}</td>
                      <td>{new Date(venta.fecha).toLocaleDateString()} {new Date(venta.fecha).toLocaleTimeString()}</td>
                      <td><span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                        background: venta.metodo_pago === 'TARJETA' ? '#e0f2fe' : '#dcfce7',
                        color: venta.metodo_pago === 'TARJETA' ? '#0369a1' : '#15803d'
                      }}>{venta.metodo_pago}</span></td>
                      <td style={{ fontWeight: 'bold' }}>C$ {Number(venta.total).toFixed(2)}</td>
                      <td style={{ fontSize: '0.8rem', color: '#666' }}>
                        {venta.detalles.map((d: any) => `${d.cantidad}x ${d.producto?.nombre || 'Producto borrado'}`).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;