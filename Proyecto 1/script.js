let fileHandle = null;
let estudiantes = [];
let contadorCodigo = 1;
let indiceEdicion = -1; // -1 indica que es un nuevo registro; >= 0 indica edición

const btnSelectFile = document.getElementById('btnSelectFile');
const fileStatus = document.getElementById('fileStatus');
const studentForm = document.getElementById('studentForm');
const tableBody = document.getElementById('tableBody');
const btnSubmit = document.getElementById('btnSubmit');
const btnCancel = document.getElementById('btnCancel');

// 1. Vincular el archivo estudiantes.txt local
btnSelectFile.addEventListener('click', async () => {
  try {
    [fileHandle] = await window.showOpenFilePicker({
      types: [{
        description: 'Archivos de texto',
        accept: { 'text/plain': ['.txt'] }
      }]
    });

    fileStatus.textContent = `Vinculado a: ${fileHandle.name}`;
    fileStatus.classList.add('active');

    const file = await fileHandle.getFile();
    const texto = await file.text();
    cargarDatosPrevios(texto);

  } catch (err) {
    console.log('No se seleccionó ningún archivo.');
  }
});

// Parsear el contenido del TXT e inicializar la vista
function cargarDatosPrevios(contenido) {
  estudiantes = [];
  const lineas = contenido.split('\n');
  let maxCodigo = 0;

  lineas.forEach((linea) => {
    const lineaLimpia = linea.trim();
    if (lineaLimpia !== '') {
      const campos = lineaLimpia.split('|');
      if (campos.length >= 8) {
        const [codigo, nombre, nie, edad, grado, seccion, correo, telefono] = campos;

        estudiantes.push({
          codigo: codigo.trim(),
          nombre: nombre.trim(),
          nie: nie.trim(),
          edad: edad.trim(),
          grado: grado.trim(),
          seccion: seccion.trim(),
          correo: correo.trim(),
          telefono: telefono.trim()
        });

        const num = parseInt(codigo, 10);
        if (!isNaN(num) && num > maxCodigo) {
          maxCodigo = num;
        }
      }
    }
  });

  contadorCodigo = maxCodigo + 1;
  renderizarTabla();
}

// Renderizar las filas de la tabla
function renderizarTabla() {
  tableBody.innerHTML = '';

  estudiantes.forEach((est, index) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td><span class="badge-code">${est.codigo}</span></td>
      <td><strong>${est.nombre}</strong></td>
      <td>${est.nie}</td>
      <td>${est.edad}</td>
      <td>${est.grado}</td>
      <td>${est.seccion}</td>
      <td>${est.correo}</td>
      <td>${est.telefono}</td>
      <td>
        <button type="button" class="btn btn-edit" onclick="prepararEdicion(${index})">Editar</button>
      </td>
    `;
    tableBody.appendChild(fila);
  });
}

// Cargar datos en el formulario para editar
function prepararEdicion(index) {
  indiceEdicion = index;
  const est = estudiantes[index];

  document.getElementById('nombre').value = est.nombre;
  document.getElementById('nie').value = est.nie;
  document.getElementById('edad').value = est.edad;
  document.getElementById('grado').value = est.grado;
  document.getElementById('seccion').value = est.seccion;
  document.getElementById('correo').value = est.correo;
  document.getElementById('telefono').value = est.telefono;

  btnSubmit.textContent = 'GUARDAR CAMBIOS EN TXT';
  btnSubmit.style.backgroundColor = '#059669';
  btnCancel.style.display = 'block';
}

// Cancelar edición
btnCancel.addEventListener('click', resetearFormulario);

function resetearFormulario() {
  indiceEdicion = -1;
  studentForm.reset();
  btnSubmit.textContent = 'REGISTRAR Y GUARDAR EN TXT';
  btnSubmit.style.backgroundColor = '#2563eb';
  btnCancel.style.display = 'none';
}

// Registrar o actualizar datos y escribir en estudiantes.txt
studentForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  if (!fileHandle) {
    alert('Primero debes seleccionar tu archivo estudiantes.txt con el botón naranja.');
    return;
  }

  const nombre = document.getElementById('nombre').value.trim();
  const nie = document.getElementById('nie').value.trim();
  const edad = document.getElementById('edad').value.trim();
  const grado = document.getElementById('grado').value;
  const seccion = document.getElementById('seccion').value;
  const correo = document.getElementById('correo').value.trim();
  const telefono = document.getElementById('telefono').value.trim();

  if (indiceEdicion === -1) {
    // Registro nuevo
    const codigo = String(contadorCodigo).padStart(3, '0');
    estudiantes.push({ codigo, nombre, nie, edad, grado, seccion, correo, telefono });
    contadorCodigo++;
  } else {
    // Edición de registro existente
    estudiantes[indiceEdicion] = {
      codigo: estudiantes[indiceEdicion].codigo,
      nombre, nie, edad, grado, seccion, correo, telefono
    };
  }

  try {
    // Convertir el arreglo completo a líneas formateadas con pipe (|)
    const lineasTXT = estudiantes.map(est => 
      `${est.codigo}|${est.nombre}|${est.nie}|${est.edad}|${est.grado}|${est.seccion}|${est.correo}|${est.telefono}`
    ).join('\n') + '\n';

    // Guardar el contenido actualizado dentro del archivo
    const writable = await fileHandle.createWritable();
    await writable.write(lineasTXT);
    await writable.close();

    renderizarTabla();
    resetearFormulario();
    alert('¡Archivo estudiantes.txt actualizado con éxito!');

  } catch (err) {
    alert('Error al escribir en el archivo.');
    console.error(err);
  }
});