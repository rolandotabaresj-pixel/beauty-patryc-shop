// js/app.js
import { productos } from './productos.js';

let carrito = [];
const formatoMoneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

// Renderizar la cuadrícula principal
function renderizarProductos() {
    const contenedor = document.getElementById('grid-productos');
    contenedor.innerHTML = productos.map(prod => `
        <article class="tarjeta-producto" onclick="abrirDetalleProducto(${prod.id})">
            <img src="${prod.img}" alt="${prod.nombre}" loading="lazy">
            <h3>${prod.nombre}</h3>
            <p class="precio">${formatoMoneda.format(prod.precio)}</p>
            <button onclick="event.stopPropagation(); agregarAlCarrito(${prod.id})">Agregar al Carrito</button>
        </article>
    `).join('');
}

const modalProducto = document.getElementById('modal-producto');
const cuerpoModal = document.getElementById('modal-cuerpo');

window.abrirDetalleProducto = (id) => {
    const prod = productos.find(p => p.id === id);
    if (!prod) return;

    cuerpoModal.innerHTML = `
        <img src="${prod.img}" alt="${prod.nombre}" class="modal-imagen-flotante">
        <div class="modal-info-caja">
            <button class="btn-cerrar-modal" onclick="cerrarModal()">✖</button>
            
            <div class="modal-categoria">Cuidado Capilar</div>
            <h2>${prod.nombre}</h2>
            <div class="modal-separador"></div>
            
            <p><strong>Fórmula:</strong> ${prod.ingredientes}</p>
            <p><strong>Aplicación:</strong> ${prod.aplicacion}</p>
            <p><strong>Duración:</strong> ${prod.duracion}</p>
            
            <button class="btn-agregar-modal" onclick="agregarAlCarrito(${prod.id}); cerrarModal();">
                Agregar al Carrito - ${formatoMoneda.format(prod.precio)}
            </button>
            
            <div class="modal-marca-agua">BEAUTY</div>
        </div>
    `;
    modalProducto.classList.add('activo');
};

window.cerrarModal = () => {
    modalProducto.classList.remove('activo');
};

modalProducto.addEventListener('click', (e) => {
    if (e.target === modalProducto) {
        cerrarModal();
    }
});

window.agregarAlCarrito = (id) => {
    const producto = productos.find(p => p.id === id);
    const itemEnCarrito = carrito.find(item => item.id === id);
    
    if (itemEnCarrito) {
        itemEnCarrito.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    actualizarCarrito();
    abrirCarrito();
};

window.cambiarCantidad = (id, delta) => {
    const item = carrito.find(i => i.id === id);
    if (!item) return;
    
    item.cantidad += delta;
    if (item.cantidad <= 0) {
        carrito = carrito.filter(i => i.id !== id);
    }
    actualizarCarrito();
};

function actualizarCarrito() {
    const contenedor = document.getElementById('items-carrito');
    const totalElemento = document.getElementById('total-carrito');
    const btnBurbuja = document.getElementById('contador-burbuja');
    
    let total = 0;
    let cantidadTotal = 0;
    
    contenedor.innerHTML = carrito.map(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        cantidadTotal += item.cantidad;
        return `
            <div class="item-carrito">
                <div class="item-info">
                    <h4>${item.nombre}</h4>
                    <p>${formatoMoneda.format(item.precio)} c/u</p>
                </div>
                <div class="item-controles">
                    <button onclick="cambiarCantidad(${item.id}, -1)">-</button>
                    <span>${item.cantidad}</span>
                    <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
                </div>
                <div class="item-subtotal">${formatoMoneda.format(subtotal)}</div>
            </div>
        `;
    }).join('');
    
    totalElemento.textContent = formatoMoneda.format(total);
    btnBurbuja.textContent = cantidadTotal;
    validarFormulario();
}

const sidebar = document.getElementById('sidebar-carrito');
window.abrirCarrito = () => sidebar.classList.add('activo');
window.cerrarCarrito = () => sidebar.classList.remove('activo');

const inputNombre = document.getElementById('cliente-nombre');
const inputDireccion = document.getElementById('cliente-direccion');
const btnPagar = document.getElementById('btn-pagar');

function validarFormulario() {
    const esValido = inputNombre.value.trim() !== '' && inputDireccion.value.trim() !== '' && carrito.length > 0;
    btnPagar.disabled = !esValido;
}

inputNombre.addEventListener('input', validarFormulario);
inputDireccion.addEventListener('input', validarFormulario);

window.enviarWhatsApp = () => {
    if (btnPagar.disabled) return;
    
    const nombre = inputNombre.value.trim();
    const direccion = inputDireccion.value.trim();
    let totalFinal = 0;
    
    let mensaje = `*NUEVO PEDIDO - BEAUTY PATRYC* 🌿\n\n`;
    mensaje += `*Cliente:* ${nombre}\n`;
    mensaje += `*Dirección:* ${direccion}\n\n`;
    mensaje += `*Productos:*\n`;
    
    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        totalFinal += subtotal;
        mensaje += `- ${item.cantidad}x ${item.nombre}\n`;
        mensaje += `  Unitario: ${formatoMoneda.format(item.precio)} | Total: ${formatoMoneda.format(subtotal)}\n`;
    });
    
    mensaje += `\n*TOTAL A PAGAR: ${formatoMoneda.format(totalFinal)}*`;
    
    const numeroWhatsApp = "573244022566";
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    
    window.open(url, '_blank');
};

renderizarProductos();
