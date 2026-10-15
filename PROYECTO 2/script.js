// Cargar alumnos guardados previamente en la memoria del navegador (localStorage)
let registrosMemoria = JSON.parse(localStorage.getItem('alumnos_notas')) || [];

// ==========================================
// REFERENCIAS A ELEMENTOS DEL DOM
// ==========================================
const formNotas = document.getElementById('formNotas');
const errorMsg = document.getElementById('errorMsg');

const resultadoCard = document.getElementById('resultadoCard');
const resNombre = document.getElementById('resNombre');
const resNie = document.getElementById('resNie');
const resPromedio = document.getElementById('resPromedio');
const resClasificacion = document.getElementById('resClasificacion');
const btnDescargar = document.getElementById('btnDescargar');

const fileInput = document.getElementById('fileInput');
const btnMostrar = document.getElementById('btnMostrar');
const tablaContainer = document.getElementById('tablaContainer');
const tbodyNotas = document.getElementById('tbodyNotas');

const statTotal = document.getElementById('statTotal');
const statAprobados = document.getElementById('statAprobados');
const statReprobados = document.getElementById('statReprobados');

// Si ya existen registros guardados, mostrar el botón de descarga desde el inicio
if (registrosMemoria.length > 0) {
  btnDescargar.classList.remove('hidden');
}

/**
 * Función que clasifica al estudiante según su promedio
 */
function obtenerClasificacion(promedio) {
  if (promedio >= 9.0 && promedio <= 10.0) return "Excelente";
  if (promedio >= 7.0 && promedio < 9.0) return "Muy bueno";
  if (promedio >= 6.0 && promedio < 7.0) return "Aprobado";
  return "Reprobado";
}

// ==========================================
// 1. INGRESO Y CÁLCULO DE NOTAS
// ==========================================
formNotas.addEventListener('submit', (e) => {
  e.preventDefault();
  errorMsg.style.display = 'none';

  const nombre = document.getElementById('nombre').value.trim();
  const nie = document.getElementById('nie').value.trim();
  const n1 = parseFloat(document.getElementById('nota1').value);
  const n2 = parseFloat(document.getElementById('nota2').value);
  const n3 = parseFloat(document.getElementById('nota3').value);
  const ex = parseFloat(document.getElementById('examen').value);

  // Validación: Notas entre 0 y 10
  const notas = [n1, n2, n3, ex];
  if (notas.some(n => isNaN(n) || n < 0 || n > 10)) {
    errorMsg.textContent = "▲ ERROR: La nota debe estar entre 0 y 10.";
    errorMsg.style.display = 'block';
    return;
  }

  // Cálculo del promedio
  const promedioNum = (n1 + n2 + n3 + ex) / 4;
  const promedioStr = promedioNum.toFixed(2);
  const clasificacion = obtenerClasificacion(promedioNum);

  // Mostrar resultado individual
  resNombre.textContent = nombre;
  resNie.textContent = nie;
  resPromedio.textContent = promedioStr;
  resClasificacion.textContent = clasificacion.toUpperCase();
  resClasificacion.className = 'badge ' + clasificacion.toLowerCase().replace(' ', '-');
  resultadoCard.classList.remove('hidden');

  // Crear la línea con formato TXT: NIE|Nombre|Nota1|Nota2|Nota3|Examen|Promedio|Clasificación
  const lineaTXT = `${nie}|${nombre}|${n1}|${n2}|${n3}|${ex}|${promedioStr}|${clasificacion}`;
  
  // Agregar al arreglo en memoria y guardar permanentemente en el navegador
  registrosMemoria.push(lineaTXT);
  localStorage.setItem('alumnos_notas', JSON.stringify(registrosMemoria));

  btnDescargar.classList.remove('hidden');
  formNotas.reset();

  alert(`¡Registro de ${nombre} guardado exitosamente!`);
});

// ==========================================
// 2. DESCARGAR ARCHIVO NOTAS.TXT
// ==========================================
btnDescargar.addEventListener('click', () => {
  if (registrosMemoria.length === 0) {
    alert("No hay registros guardados para descargar.");
    return;
  }

  const contenido = registrosMemoria.join('\n');
  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'notas.txt'; // Nombre exacto del archivo descargado
  link.click();

  URL.revokeObjectURL(url);
});

// ==========================================
// 3. MOSTRAR REGISTROS EN LA TABLA
// ==========================================
btnMostrar.addEventListener('click', () => {
  const file = fileInput.files[0];

  // Caso A: El usuario seleccionó un archivo .txt con el botón "Elegir archivo"
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const lineas = e.target.result.split(/\r?\n/).filter(l => l.trim() !== '');
      if (lineas.length === 0) {
        alert("El archivo subido está vacío.");
        return;
      }
      procesarYMostrarTabla(lineas);
    };
    reader.readAsText(file);
  } 
  // Caso B: No eligió archivo, mostramos los alumnos guardados internamente
  else if (registrosMemoria.length > 0) {
    procesarYMostrarTabla(registrosMemoria);
  } 
  // Caso C: No hay alumnos registrados ni archivo subido
  else {
    alert("No hay alumnos registrados. Registra uno arriba o selecciona un archivo notas.txt con datos.");
  }
});

/**
 * Función que procesa cada línea de registro y dibuja la tabla HTML
 */
function procesarYMostrarTabla(lineas) {
  tbodyNotas.innerHTML = '';
  let total = 0, aprobados = 0, reprobados = 0;

  lineas.forEach(linea => {
    let datos = linea.split('|');
    if (datos.length < 2) datos = linea.split(',');

    if (datos.length >= 2) {
      let nie = datos[0] ? datos[0].trim() : 'N/A';
      let nombre = datos[1] ? datos[1].trim() : 'Sin Nombre';

      let promedio = "0.00";
      if (datos.length >= 7) {
        promedio = parseFloat(datos[6]).toFixed(2);
      } else if (datos.length >= 3 && !isNaN(parseFloat(datos[2]))) {
        promedio = parseFloat(datos[2]).toFixed(2);
      }

      let resultado = "N/A";
      if (datos.length >= 8) {
        resultado = datos[7].trim();
      } else if (datos.length >= 4) {
        resultado = datos[3].trim();
      } else {
        resultado = obtenerClasificacion(parseFloat(promedio));
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${nie}</td>
        <td>${nombre}</td>
        <td>${promedio}</td>
        <td>${resultado}</td>
      `;
      tbodyNotas.appendChild(tr);

      total++;
      if (parseFloat(promedio) >= 6.0) aprobados++;
      else reprobados++;
    }
  });

  if (total === 0) {
    alert("El archivo seleccionado no contiene registros con un formato válido.");
  } else {
    statTotal.textContent = total;
    statAprobados.textContent = aprobados;
    statReprobados.textContent = reprobados;
    tablaContainer.classList.remove('hidden');
  }
}