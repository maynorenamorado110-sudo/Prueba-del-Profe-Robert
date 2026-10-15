let pedidos = [
    {
        codigo: "001",
        cliente: "Carlos López",
        producto: "Pupusa",
        cantidad: 10,
        precioUnitario: 0.75,
        subtotal: 7.50,
        descuento: 0.75,
        total: 6.75,
        metodoPago: "Efectivo"
    },
    {
        codigo: "002",
        cliente: "Ana Martínez",
        producto: "Pizza",
        cantidad: 2,
        precioUnitario: 2.00,
        subtotal: 4.00,
        descuento: 0.00,
        total: 4.00,
        metodoPago: "Tarjeta"
    }
];

const pedidoForm = document.getElementById('pedidoForm');
const ticketSection = document.getElementById('ticketSection');
const ticketOutput = document.getElementById('ticketOutput');
const btnCargarTxt = document.getElementById('btnCargarTxt');
const pedidosTxtContent = document.getElementById('pedidosTxtContent');
const tablaPedidosBody = document.querySelector('#tablaPedidos tbody');
const btnResumen = document.getElementById('btnResumen');
const resumenModal = document.getElementById('resumenModal');
const resumenOutput = document.getElementById('resumenOutput');
const closeModal = document.querySelector('.close');

function generarCodigo() {
    let siguiente = pedidos.length + 1;
    return String(siguiente).padStart(3, '0');
}

pedidoForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const cliente = document.getElementById('cliente').value.trim();
    const productoData = document.getElementById('producto').value;
    const cantidad = parseInt(document.getElementById('cantidad').value);
    const metodoPago = document.querySelector('input[name="pago"]:checked').value;

    if (!productoData) {
        alert("Por favor seleccione un producto.");
        return;
    }

    const [_, nombreProducto, precioStr] = productoData.split('|');
    const precioUnitario = parseFloat(precioStr);

    const subtotal = precioUnitario * cantidad;
    
    let descuento = 0;
    if (cantidad >= 5) {
        descuento = subtotal * 0.10;
    }
    const total = subtotal - descuento;

    const nuevoPedido = {
        codigo: generarCodigo(),
        cliente: cliente,
        producto: nombreProducto,
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        subtotal: Number(subtotal.toFixed(2)),
        descuento: Number(descuento.toFixed(2)),
        total: Number(total.toFixed(2)),
        metodoPago: metodoPago
    };

    pedidos.push(nuevoPedido);
    mostrarTicket(nuevoPedido);
    actualizarTabla();
    pedidoForm.reset();
});

function mostrarTicket(p) {
    ticketSection.style.display = 'block';
    ticketOutput.textContent = 
`══════════════════════════════
      PEDIDO REGISTRADO     
══════════════════════════════
Cliente: ${p.cliente}
Producto: ${p.producto}
Cantidad: ${p.cantidad}
Subtotal: $${p.subtotal.toFixed(2)}
Descuento: $${p.descuento.toFixed(2)}
TOTAL: $${p.total.toFixed(2)}
Pago: ${p.metodoPago}
══════════════════════════════`;
}

function actualizarTabla() {
    tablaPedidosBody.innerHTML = '';
    pedidos.forEach(p => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${p.codigo}</td>
            <td>${p.cliente}</td>
            <td>${p.producto}</td>
            <td>${p.cantidad}</td>
            <td>$${p.total.toFixed(2)}</td>
        `;
        tablaPedidosBody.appendChild(fila);
    });
}

btnCargarTxt.addEventListener('click', function() {
    let lineasTxt = [];
    pedidos.forEach(p => {
        let linea = `${p.codigo}|${p.cliente}|${p.producto}|${p.cantidad}|${p.precioUnitario.toFixed(2)}|${p.subtotal.toFixed(2)}|${p.descuento.toFixed(2)}|${p.total.toFixed(2)}|${p.metodoPago}`;
        lineasTxt.push(linea);
    });
    pedidosTxtContent.value = lineasTxt.join('\n');
    actualizarTabla();
});

btnResumen.addEventListener('click', function() {
    let totalVentas = pedidos.reduce((sum, p) => sum + p.total, 0);
    let cantidadPedidos = pedidos.length;

    resumenOutput.textContent = 
`══════════════════════════
    RESUMEN DE VENTAS     
══════════════════════════
Pedidos: ${cantidadPedidos}
Ventas: 
$${totalVentas.toFixed(2)}
══════════════════════════`;

    resumenModal.style.display = 'flex';
});

closeModal.addEventListener('click', function() {
    resumenModal.style.display = 'none';
});

window.addEventListener('click', function(e) {
    if (e.target === resumenModal) {
        resumenModal.style.display = 'none';
    }
});

actualizarTabla();