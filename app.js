// Datos de ejemplo para la aplicación
let empresas = JSON.parse(localStorage.getItem('empresas')) || [
    {
        id: 1,
        nombre: "TechSolutions S.A.",
        contacto: "María González",
        cargo: "Directora de RRHH",
        email: "maria@techsolutions.com",
        telefono: "+34 912 345 678",
        rubro: "tecnologia",
        tamano: "mediana",
        servicios: ["checkup", "comunicacion"],
        estado: "activa",
        notas: "Interesados en taller de comunicación para todo el equipo. Muy receptivos a feedback.",
        fuente: "recomendacion",
        fechaCreacion: "2023-10-15",
        ultimoContacto: "2023-11-05"
    },
    {
        id: 2,
        nombre: "DiseñoCreativo",
        contacto: "Javier Martínez",
        cargo: "CEO",
        email: "javier@disenocreativo.es",
        telefono: "+34 645 789 123",
        rubro: "servicios",
        tamano: "pequena",
        servicios: ["contratacion"],
        estado: "prospecto",
        notas: "Necesitan ayuda con su primera contratación. Empresa en crecimiento.",
        fuente: "web",
        fechaCreacion: "2023-11-01",
        ultimoContacto: "2023-11-10"
    }
];

let actividad = JSON.parse(localStorage.getItem('actividad')) || [
    { tipo: 'empresa', accion: 'añadida', objetivo: 'TechSolutions S.A.', fecha: '2023-10-15' },
    { tipo: 'servicio', accion: 'asignado', objetivo: 'Check-Up Salud Laboral', empresa: 'TechSolutions S.A.', fecha: '2023-10-20' },
    { tipo: 'empresa', accion: 'añadida', objetivo: 'DiseñoCreativo', fecha: '2023-11-01' },
    { tipo: 'servicio', accion: 'asignado', objetivo: 'Design Primer Empleado', empresa: 'DiseñoCreativo', fecha: '2023-11-05' }
];

let documentos = JSON.parse(localStorage.getItem('documentos')) || [];

// Variables para paginación
let currentPage = 1;
const empresasPerPage = 5;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadDashboard();
    loadEmpresas();
    setupEventListeners();
    loadServiceDetails();
    loadDocumentButtons();
    updateEmpresaSelector();
    setupEmpresasListeners();
});

// Navegación
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            
            // Actualizar navegación
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
            
            // Mostrar sección correspondiente
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(target).classList.add('active');
            
            // Si es la sección de documentos, actualizar el selector
            if (target === 'documentos') {
                updateEmpresaSelector();
            }
        });
    });
}

// Dashboard
function loadDashboard() {
    // Estadísticas
    document.getElementById('total-empresas').textContent = empresas.length;
    document.getElementById('total-empresas-stat').textContent = empresas.length;
    
    const serviciosCount = empresas.reduce((count, empresa) => {
        return count + empresa.servicios.length;
    }, 0);
    document.getElementById('servicios-activos').textContent = serviciosCount;
    document.getElementById('servicios-activos-stat').textContent = serviciosCount;
    
    // Próximas reuniones (ficticias para el ejemplo)
    document.getElementById('proximas-reuniones').textContent = "2";
    
    // Empresas añadidas este mes
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const empresasEsteMes = empresas.filter(empresa => {
        const empresaDate = new Date(empresa.fechaCreacion);
        return empresaDate.getMonth() === currentMonth && empresaDate.getFullYear() === currentYear;
    });
    document.getElementById('empresas-recientes-stat').textContent = empresasEsteMes.length;
    
    // Actividad reciente
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '';
    
    if (actividad.length === 0) {
        activityList.innerHTML = '<li>No hay actividad reciente</li>';
        return;
    }
    
    actividad.slice().reverse().forEach(item => {
        const li = document.createElement('li');
        
        let texto = '';
        switch (item.tipo) {
            case 'empresa':
                texto = `Empresa <strong>${item.objetivo}</strong> ${item.accion}`;
                break;
            case 'servicio':
                texto = `Servicio <strong>${item.objetivo}</strong> ${item.accion} para <strong>${item.empresa}</strong>`;
                break;
            case 'documento':
                texto = `Documento <strong>${item.objetivo}</strong> ${item.accion}`;
                break;
        }
        
        li.innerHTML = `${texto} - <span class="fecha">${item.fecha}</span>`;
        activityList.appendChild(li);
    });
}

// Listeners específicos para la sección de empresas
function setupEmpresasListeners() {
    // Botón añadir empresa en el header
    document.getElementById('add-empresa-btn').addEventListener('click', () => {
        openEmpresaModal();
    });
    
    // Botón añadir primera empresa en estado vacío
    document.getElementById('add-first-empresa').addEventListener('click', () => {
        openEmpresaModal();
    });
    
    // Botones de paginación
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadEmpresas();
        }
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        const totalPages = Math.ceil(empresas.length / empresasPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            loadEmpresas();
        }
    });
    
    // Botón exportar
    document.getElementById('export-btn').addEventListener('click', exportEmpresas);
    
    // Botón actualizar
    document.getElementById('refresh-btn').addEventListener('click', () => {
        loadEmpresas();
    });
    
    // Filtros
    document.getElementById('empresa-search').addEventListener('input', filtrarEmpresas);
    document.getElementById('servicio-filter').addEventListener('change', filtrarEmpresas);
    document.getElementById('estado-filter').addEventListener('change', filtrarEmpresas);
}

// Función para abrir el modal de empresa
function openEmpresaModal(empresaId = null) {
    if (empresaId) {
        // Modo edición
        editEmpresa(empresaId);
    } else {
        // Modo creación
        document.getElementById('modal-title').textContent = 'Añadir Nueva Empresa';
        document.getElementById('empresa-form').reset();
        document.getElementById('empresa-id').value = '';
        
        // Establecer valores por defecto
        document.getElementById('empresa-estado').value = 'prospecto';
    }
    openModal();
}

// Gestión de empresas - FUNCIÓN PRINCIPAL CORREGIDA
function loadEmpresas() {
    const empresasTable = document.querySelector('#empresas-table tbody');
    empresasTable.innerHTML = '';
    
    if (empresas.length === 0) {
        empresasTable.innerHTML = `
            <tr class="empty-state">
                <td colspan="6">
                    <div class="empty-content">
                        <div class="empty-icon">🏢</div>
                        <h4>No hay empresas registradas</h4>
                        <p>Comienza añadiendo tu primera empresa cliente</p>
                        <button id="add-first-empresa" class="btn-primary">Añadir primera empresa</button>
                    </div>
                </td>
            </tr>
        `;
        
        // Reasignar event listener al botón
        document.getElementById('add-first-empresa').addEventListener('click', () => {
            openEmpresaModal();
        });
        
        // Actualizar paginación
        updatePaginationControls();
        return;
    }
    
    // Aplicar filtros
    let empresasFiltradas = aplicarFiltros();
    
    // Aplicar paginación
    const startIndex = (currentPage - 1) * empresasPerPage;
    const endIndex = startIndex + empresasPerPage;
    const empresasPaginadas = empresasFiltradas.slice(startIndex, endIndex);
    
    // Generar filas de la tabla
    empresasPaginadas.forEach(empresa => {
        const tr = document.createElement('tr');
        
        // Servicios como badges
        const serviciosHTML = empresa.servicios.map(servicio => {
            let texto = '';
            switch(servicio) {
                case 'checkup': texto = 'Check-Up'; break;
                case 'comunicacion': texto = 'Comunicación'; break;
                case 'contratacion': texto = 'Contratación'; break;
            }
            return `<span class="badge">${texto}</span>`;
        }).join(' ');
        
        // Estado
        let estadoClass = '';
        let estadoText = '';
        switch(empresa.estado) {
            case 'activa':
                estadoClass = 'estado-activa';
                estadoText = 'Activa';
                break;
            case 'prospecto':
                estadoClass = 'estado-prospecto';
                estadoText = 'Prospecto';
                break;
            case 'inactiva':
                estadoClass = 'estado-inactiva';
                estadoText = 'Inactiva';
                break;
            case 'potencial':
                estadoClass = 'estado-potencial';
                estadoText = 'Potencial';
                break;
        }
        
        tr.innerHTML = `
            <td>${empresa.nombre}</td>
            <td>
                <strong>${empresa.contacto}</strong><br>
                ${empresa.cargo || 'Sin cargo especificado'}<br>
                ${empresa.email}<br>
                ${empresa.telefono || 'Sin teléfono'}
            </td>
            <td>${serviciosHTML}</td>
            <td><span class="estado-badge ${estadoClass}">${estadoText}</span></td>
            <td>${formatFecha(empresa.ultimoContacto)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-icon edit-empresa" data-id="${empresa.id}" title="Editar">
                        ✏️ Editar
                    </button>
                    <button class="action-btn btn-icon delete-empresa" data-id="${empresa.id}" title="Eliminar">
                        🗑️ Eliminar
                    </button>
                </div>
            </td>
        `;
        
        empresasTable.appendChild(tr);
    });
    
    // Actualizar controles de paginación
    updatePaginationControls(empresasFiltradas.length);
    
    // Reasignar event listeners a los botones de acción
    document.querySelectorAll('.edit-empresa').forEach(btn => {
        btn.addEventListener('click', () => openEmpresaModal(btn.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.delete-empresa').forEach(btn => {
        btn.addEventListener('click', () => deleteEmpresa(btn.getAttribute('data-id')));
    });
}

// Aplicar filtros
function aplicarFiltros() {
    const texto = document.getElementById('empresa-search').value.toLowerCase();
    const servicio = document.getElementById('servicio-filter').value;
    const estado = document.getElementById('estado-filter').value;
    
    return empresas.filter(empresa => {
        // Filtro de texto
        const coincideTexto = texto === '' || 
                            empresa.nombre.toLowerCase().includes(texto) || 
                            empresa.contacto.toLowerCase().includes(texto) ||
                            empresa.email.toLowerCase().includes(texto);
        
        // Filtro de servicio
        const coincideServicio = servicio === '' || empresa.servicios.includes(servicio);
        
        // Filtro de estado
        const coincideEstado = estado === '' || empresa.estado === estado;
        
        return coincideTexto && coincideServicio && coincideEstado;
    });
}

// Actualizar controles de paginación
function updatePaginationControls(totalFiltradas = null) {
    const totalEmpresas = totalFiltradas !== null ? totalFiltradas : empresas.length;
    const totalPages = Math.ceil(totalEmpresas / empresasPerPage);
    
    // Actualizar información
    const startIndex = (currentPage - 1) * empresasPerPage;
    const endIndex = Math.min(startIndex + empresasPerPage, totalEmpresas);
    const showingCount = totalEmpresas > 0 ? endIndex - startIndex : 0;
    
    document.getElementById('empresas-mostradas').textContent = showingCount;
    document.getElementById('empresas-totales').textContent = totalEmpresas;
    document.querySelector('.page-info').textContent = `Página ${currentPage} de ${totalPages}`;
    
    // Actualizar botones
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages || totalPages === 0;
}

// Formatear fecha
function formatFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Exportar empresas
function exportEmpresas() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80);
    doc.text("Listado de Empresas - MIVRA", 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generado el ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
    
    // Logo MIVRA (texto como placeholder)
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text("MIVRA", 15, 15);
    doc.setFontSize(10);
    doc.text("personas + process", 15, 20);
    
    // Contenido
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    let y = 40;
    empresas.forEach((empresa, index) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFont(undefined, 'bold');
        doc.setTextColor(230, 126, 34);
        doc.text(`${index + 1}. ${empresa.nombre}`, 15, y);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        
        doc.text(`Contacto: ${empresa.contacto} | ${empresa.email}`, 15, y + 7);
        doc.text(`Servicios: ${empresa.servicios.join(', ')}`, 15, y + 14);
        doc.text(`Estado: ${empresa.estado}`, 15, y + 21);
        
        y += 30;
    });
    
    // Guardar PDF
    doc.save('MIVRA_Listado_Empresas.pdf');
    
    // Registrar actividad
    actividad.push({
        tipo: 'documento',
        accion: 'exportado',
        objetivo: 'Listado de Empresas',
        fecha: new Date().toISOString().split('T')[0]
    });
    
    guardarDatos();
    loadDashboard();
}

// Función para añadir/editar empresa
function addEmpresa(e) {
    e.preventDefault();
    
    // Validar formulario
    if (!validateEmpresaForm()) {
        return;
    }
    
    // Obtener servicios seleccionados
    const serviciosSeleccionados = [];
    document.querySelectorAll('input[name="servicios"]:checked').forEach(checkbox => {
        serviciosSeleccionados.push(checkbox.value);
    });
    
    const nuevaEmpresa = {
        id: document.getElementById('empresa-id').value || Date.now(),
        nombre: document.getElementById('empresa-nombre').value,
        contacto: document.getElementById('empresa-contacto').value,
        cargo: document.getElementById('empresa-cargo').value,
        email: document.getElementById('empresa-email').value,
        telefono: document.getElementById('empresa-telefono').value,
        rubro: document.getElementById('empresa-rubro').value,
        tamano: document.getElementById('empresa-tamano').value,
        servicios: serviciosSeleccionados,
        estado: document.getElementById('empresa-estado').value,
        notas: document.getElementById('empresa-notas').value,
        fuente: document.getElementById('empresa-fuente').value,
        fechaCreacion: document.getElementById('empresa-id').value ? 
            empresas.find(e => e.id == document.getElementById('empresa-id').value).fechaCreacion : 
            new Date().toISOString().split('T')[0],
        ultimoContacto: new Date().toISOString().split('T')[0]
    };
    
    // Si estamos editando
    if (document.getElementById('empresa-id').value) {
        const index = empresas.findIndex(emp => emp.id == document.getElementById('empresa-id').value);
        empresas[index] = nuevaEmpresa;
        actividad.push({
            tipo: 'empresa',
            accion: 'actualizada',
            objetivo: nuevaEmpresa.nombre,
            fecha: new Date().toISOString().split('T')[0]
        });
    } else {
        // Si es nueva empresa
        empresas.push(nuevaEmpresa);
        actividad.push({
            tipo: 'empresa',
            accion: 'añadida',
            objetivo: nuevaEmpresa.nombre,
            fecha: new Date().toISOString().split('T')[0]
        });
    }
    
    // Guardar y actualizar
    guardarDatos();
    loadDashboard();
    loadEmpresas();
    updateEmpresaSelector();
    closeModal();
    
    // Mostrar mensaje de éxito
    alert(`Empresa ${document.getElementById('empresa-id').value ? 'actualizada' : 'añadida'} correctamente`);
}

// Validar formulario de empresa
function validateEmpresaForm() {
    let isValid = true;
    
    // Resetear mensajes de error
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
    });
    
    // Validar nombre
    const nombre = document.getElementById('empresa-nombre').value;
    if (!nombre.trim()) {
        document.getElementById('nombre-error').textContent = 'El nombre es obligatorio';
        document.getElementById('nombre-error').style.display = 'block';
        isValid = false;
    }
    
    // Validar contacto
    const contacto = document.getElementById('empresa-contacto').value;
    if (!contacto.trim()) {
        document.getElementById('contacto-error').textContent = 'El contacto es obligatorio';
        document.getElementById('contacto-error').style.display = 'block';
        isValid = false;
    }
    
    // Validar email
    const email = document.getElementById('empresa-email').value;
    if (!email.trim()) {
        document.getElementById('email-error').textContent = 'El email es obligatorio';
        document.getElementById('email-error').style.display = 'block';
        isValid = false;
    } else if (!isValidEmail(email)) {
        document.getElementById('email-error').textContent = 'El email no tiene un formato válido';
        document.getElementById('email-error').style.display = 'block';
        isValid = false;
    }
    
    return isValid;
}

// Validar email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function editEmpresa(id) {
    const empresa = empresas.find(emp => emp.id == id);
    
    if (empresa) {
        document.getElementById('empresa-id').value = empresa.id;
        document.getElementById('empresa-nombre').value = empresa.nombre;
        document.getElementById('empresa-contacto').value = empresa.contacto;
        document.getElementById('empresa-cargo').value = empresa.cargo || '';
        document.getElementById('empresa-email').value = empresa.email;
        document.getElementById('empresa-telefono').value = empresa.telefono || '';
        document.getElementById('empresa-rubro').value = empresa.rubro || '';
        document.getElementById('empresa-tamano').value = empresa.tamano || '';
        document.getElementById('empresa-estado').value = empresa.estado;
        document.getElementById('empresa-notas').value = empresa.notas || '';
        document.getElementById('empresa-fuente').value = empresa.fuente || '';
        
        // Seleccionar servicios
        document.querySelectorAll('input[name="servicios"]').forEach(checkbox => {
            checkbox.checked = empresa.servicios.includes(checkbox.value);
        });
        
        document.getElementById('modal-title').textContent = 'Editar Empresa';
        openModal();
    }
}

function deleteEmpresa(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta empresa?')) {
        const index = empresas.findIndex(emp => emp.id == id);
        if (index !== -1) {
            const nombreEmpresa = empresas[index].nombre;
            empresas.splice(index, 1);
            
            actividad.push({
                tipo: 'empresa',
                accion: 'eliminada',
                objetivo: nombreEmpresa,
                fecha: new Date().toISOString().split('T')[0]
            });
            
            guardarDatos();
            loadDashboard();
            loadEmpresas();
            updateEmpresaSelector();
        }
    }
}

// Servicios
function loadServiceDetails() {
    const serviceButtons = document.querySelectorAll('.btn-service');
    
    serviceButtons.forEach(button => {
        button.addEventListener('click', () => {
            const service = button.getAttribute('data-service');
            mostrarDetallesServicio(service);
        });
    });
}

function mostrarDetallesServicio(service) {
    const serviceDetails = document.getElementById('service-details');
    let contenido = '';
    
    switch(service) {
        case 'checkup':
            contenido = `
                <h3>Check-Up Salud Laboral</h3>
                <p>Evaluación express del clima laboral y procesos de RRHH que incluye:</p>
                <ul>
                    <li>Entrevistas individuales confidenciales</li>
                    <li>Análisis de documentación básica</li>
                    <li>Informe ejecutivo con hallazgos y recomendaciones</li>
                </ul>
                <p><strong>Duración:</strong> 2-3 días</p>
                <p><strong>Inversión:</strong> €450</p>
                <button class="btn-primary" onclick="generarPDF('checkup')">Generar Propuesta</button>
            `;
            break;
        case 'comunicacion':
            contenido = `
                <h3>Taller de Comunicación Eficaz</h3>
                <p>Sesión vivencial para equipos que incluye:</p>
                <ul>
                    <li>Dinámicas prácticas sobre niveles de escucha</li>
                    <li>Distinción entre hechos y juicios</li>
                    <li>Práctica de conversaciones de feedback</li>
                    <li>Kit de supervivencia para comunicación interna</li>
                </ul>
                <p><strong>Duración:</strong> 3-4 horas</p>
                <p><strong>Inversión:</strong> €600 (hasta 10 personas)</p>
                <button class="btn-primary" onclick="generarPDF('comunicacion')">Generar Propuesta</button>
            `;
            break;
        case 'contratacion':
            contenido = `
                <h3>Design del Primer Empleado</h3>
                <p>Asesoría completa para la primera contratación que incluye:</p>
                <ul>
                    <li>Definición del perfil del colaborador ideal</li>
                    <li>Diseño del proceso de selección</li>
                    <li>Preparación para la transición de fundador a líder</li>
                    <li>Plan de onboarding de 30 días</li>
                </ul>
                <p><strong>Duración:</strong> 3-4 semanas</p>
                <p><strong>Inversión:</strong> €900</p>
                <button class="btn-primary" onclick="generarPDF('contratacion')">Generar Propuesta</button>
            `;
            break;
    }
    
    serviceDetails.innerHTML = contenido;
}

// Documentos
function loadDocumentButtons() {
    const documentButtons = document.querySelectorAll('.btn-document');
    
    documentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const documentType = button.getAttribute('data-document');
            const empresaId = document.getElementById('empresa-documento').value;
            generarPDF(documentType, empresaId);
        });
    });
}

function updateEmpresaSelector() {
    const selector = document.getElementById('empresa-documento');
    selector.innerHTML = '<option value="">Seleccione una empresa</option>';
    
    empresas.forEach(empresa => {
        const option = document.createElement('option');
        option.value = empresa.id;
        option.textContent = empresa.nombre;
        selector.appendChild(option);
    });
}

function loadGeneratedDocuments() {
    const documentList = document.getElementById('document-list');
    documentList.innerHTML = '';
    
    if (documentos.length === 0) {
        documentList.innerHTML = '<p class="empty-state">No hay documentos generados aún</p>';
        return;
    }
    
    documentos.slice().reverse().forEach(doc => {
        const docElement = document.createElement('div');
        docElement.className = 'document-item';
        
        docElement.innerHTML = `
            <div class="document-info">
                <h4>${doc.nombre}</h4>
                <p>Generado el ${doc.fecha} para ${doc.empresa || "General"}</p>
            </div>
            <div class="document-actions">
                <button class="btn-secondary" onclick="descargarDocumento('${doc.id}')">Descargar</button>
                <button class="btn-secondary" onclick="eliminarDocumento('${doc.id}')">Eliminar</button>
            </div>
        `;
        
        documentList.appendChild(docElement);
    });
}

function descargarDocumento(id) {
    const documento = documentos.find(doc => doc.id === id);
    if (documento) {
        // En una implementación real, aquí se recuperaría el PDF guardado
        alert(`Descargando: ${documento.nombre}`);
    }
}

function eliminarDocumento(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este documento?')) {
        const index = documentos.findIndex(doc => doc.id === id);
        if (index !== -1) {
            documentos.splice(index, 1);
            guardarDatos();
            loadGeneratedDocuments();
            
            actividad.push({
                tipo: 'documento',
                accion: 'eliminado',
                objetivo: `Documento ${id}`,
                fecha: new Date().toISOString().split('T')[0]
            });
            loadDashboard();
        }
    }
}

// Modal functions
function openModal() {
    document.getElementById('empresa-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('empresa-modal').style.display = 'none';
    document.getElementById('empresa-form').reset();
    document.getElementById('empresa-id').value = '';
}

// Event Listeners
function setupEventListeners() {
    // Modal events
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('cancel-empresa').addEventListener('click', closeModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('empresa-modal')) {
            closeModal();
        }
    });
    
    // Form submission
    document.getElementById('empresa-form').addEventListener('submit', addEmpresa);
    
    // Selector de empresa para documentos
    document.getElementById('empresa-documento').addEventListener('change', function() {
        const buttons = document.querySelectorAll('.btn-document');
        if (this.value) {
            buttons.forEach(btn => btn.disabled = false);
        } else {
            buttons.forEach(btn => btn.disabled = true);
        }
    });
}

function filtrarEmpresas() {
    currentPage = 1; // Resetear a la primera página al filtrar
    loadEmpresas();
}

// Guardar datos en localStorage
function guardarDatos() {
    localStorage.setItem('empresas', JSON.stringify(empresas));
    localStorage.setItem('actividad', JSON.stringify(actividad));
    localStorage.setItem('documentos', JSON.stringify(documentos));
}

// Generación de PDFs
function generarPDF(tipo, empresaId = null) {
    // Usar jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let contenido = [];
    let titulo = "";
    let empresaNombre = "General";
    
    if (empresaId) {
        const empresa = empresas.find(emp => emp.id == empresaId);
        if (empresa) {
            empresaNombre = empresa.nombre;
        }
    }
    
    switch(tipo) {
        case 'comunicacion':
            titulo = "Kit de Supervivencia para la Comunicación Interna";
            contenido = [
                {titulo: "1. Mapa de la Escucha", texto: "¿En qué nivel de escucha estás?"},
                {titulo: "Nivel 1: Interna", texto: "Escuchando mi propia voz. Ejemplo: 'Estoy pensando en lo que voy a responder mientras me hablan.'"},
                {titulo: "Nivel 2: Focalizada", texto: "Escuchando para entender. Ejemplo: 'Estoy prestando total atención a lo que dice mi compañero, sin juzgar.'"},
                {titulo: "Nivel 3: Global", texto: "Escuchando el contexto completo. Ejemplo: 'Noto el tono de voz, el lenguaje corporal y la emoción detrás de las palabras.'"},
                {titulo: "2. Hechos vs. Juicios", texto: "Cómo traducir juicios a hechos observables."},
                {titulo: "3. La Rueda de las Conversaciones", texto: "Pedir, Ofrecer, Obtener Compromiso, Declinar, Feedback."},
                {titulo: "4. Plantilla de Feedback S.A.N.D.", texto: "Situación, Acción, Noticia/Impacto, Deseo/Próximo Paso."}
            ];
            break;
            
        case 'onboarding':
            titulo = "Checklist de Onboarding - 30 Días";
            contenido = [
                {titulo: "Semana 1: 'Enredar'", texto: "Antes del Day 1: Escritorio/equipo listo, email y accesos creados, equipo avisado."},
                {titulo: "Día 1", texto: "Presentación con todo el equipo, almuerzo/café con el equipo o manager, revisión del 'Mapa de Roles Clave'."},
                {titulo: "Día 2-5", texto: "Asignar un 'compañero tutor', revisar procesos clave, primera tarea pequeña asignada y completada."},
                {titulo: "Semana 2-4: 'Integrar y Contribuir'", texto: "Reunión 1-a-1 de 30 min, asignar primera tarea mediana, incluir en reunión importante, solicitar feedback."}
            ];
            break;
            
        case 'contratacion':
            titulo = "Guía de Primera Contratación";
            contenido = [
                {titulo: "Fase 1: DEFINIR (Semana 1)", texto: "Tener total claridad sobre el 'para qué' contratamos."},
                {titulo: "Perfil del Futuro Colaborador", texto: "¿Qué problema queremos que resuelva? ¿Qué debe lograr en 3 meses? ¿Qué valores no puede transgredir?"},
                {titulo: "Fase 2: ATRAER (Semana 2)", texto: "Publicar un anuncio que atraiga a la persona correcta."},
                {titulo: "Fase 3: SELECCIONAR (Semanas 3-4)", texto: "Filtro de CVs, llamada de 15 min, entrevista por competencias."},
                {titulo: "Fase 4: INTEGRAR (Mes 1)", texto: "Onboarding: Primer día, primeras 4 semanas, reuniones de seguimiento."}
            ];
            break;
            
        case 'evaluacion':
            titulo = "Formato de Evaluación de Desempeño";
            contenido = [
                {titulo: "Datos del Colaborador", texto: "Nombre, puesto, departamento, fecha de evaluación, período evaluado."},
                {titulo: "Competencias Evaluadas", texto: "Liderazgo, comunicación, trabajo en equipo, orientación a resultados, innovación."},
                {titulo: "Escala de Evaluación", texto: "1: No cumple expectativas, 2: Cumple parcialmente, 3: Cumple expectativas, 4: Excede expectativas, 5: Supera ampliamente expectativas."},
                {titulo: "Comentarios del Evaluador", texto: "Espacio para comentarios cualitativos sobre el desempeño."},
                {titulo: "Plan de Desarrollo", texto: "Áreas de mejora, objetivos, acciones concretas, plazo de cumplimiento."}
            ];
            break;
            
        case 'desarrollo':
            titulo = "Plan de Desarrollo Individual";
            contenido = [
                {titulo: "Datos del Colaborador", texto: "Nombre, puesto actual, departamento, fecha."},
                {titulo: "Fortalezas Identificadas", texto: "Listado de fortalezas y talentos naturales."},
                {titulo: "Áreas de Oportunidad", texto: "Habilidades y competencias a desarrollar."},
                {titulo: "Objetivos de Desarrollo", texto: "Objetivos SMART específicos para el desarrollo."},
                {titulo: "Acciones Concretas", texto: "Actividades, cursos, mentorías o proyectos para el desarrollo."},
                {titulo: "Plazos y Seguimiento", texto: "Cronograma y fechas de revisión del plan."}
            ];
            break;
            
        case 'clima':
            titulo = "Encuesta de Clima Laboral";
            contenido = [
                {titulo: "Instrucciones", texto: "Por favor, responda con sinceridad. Todas las respuestas son anónimas y confidenciales."},
                {titulo: "Sección 1: Ambiente de Trabajo", texto: "Preguntas sobre condiciones físicas, recursos, herramientas de trabajo."},
                {titulo: "Sección 2: Relaciones Interpersonales", texto: "Preguntas sobre comunicación, trabajo en equipo, confianza."},
                {titulo: "Sección 3: Liderazgo", texto: "Preguntas sobre supervisión, feedback, reconocimiento."},
                {titulo: "Sección 4: Desarrollo Profesional", texto: "Preguntas sobre oportunidades de crecimiento, formación, carrera."},
                {titulo: "Sección 5: Compensación y Beneficios", texto: "Preguntas sobre salario, beneficios, equidad."}
            ];
            break;
            
        case 'checkup':
            titulo = "Propuesta - Check-Up Salud Laboral";
            contenido = [
                {titulo: "Objetivo del Servicio", texto: "Evaluación express del clima laboral y procesos de RRHH para identificar áreas de mejora y oportunidades."},
                {titulo: "Alcance", texto: "Entrevistas individuales confidenciales con key stakeholders, análisis de documentación existente, y entrega de informe ejecutivo."},
                {titulo: "Metodología", texto: "1. Diagnóstico inicial 2. Recolección de información 3. Análisis de datos 4. Elaboración de informe 5. Presentación de resultados"},
                {titulo: "Entregables", texto: "Informe ejecutivo con hallazgos, recomendaciones prioritarias y plan de acción inicial."},
                {titulo: "Duración y Inversión", texto: "2-3 días | €450 + IVA"}
            ];
            break;
    }
    
    // Agregar logo MIVRA (texto como placeholder)
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text("MIVRA", 15, 15);
    doc.setFontSize(10);
    doc.text("personas + process", 15, 20);
    
    // Configurar PDF
    doc.setFontSize(20);
    doc.text(titulo, 105, 30, { align: 'center' });
    
    if (empresaId) {
        doc.setFontSize(12);
        doc.text(`Para: ${empresaNombre}`, 105, 40, { align: 'center' });
    }
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    let y = 50;
    contenido.forEach((item, index) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
            
            // Agregar logo en cada página
            doc.setFontSize(16);
            doc.setTextColor(44, 62, 80);
            doc.text("MIVRA", 15, 15);
            doc.setFontSize(10);
            doc.text("personas + process", 15, 20);
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
        }
        
        doc.setFont(undefined, 'bold');
        doc.setTextColor(230, 126, 34);
        doc.text(item.titulo, 15, y);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        
        const splitText = doc.splitTextToSize(item.texto, 180);
        doc.text(splitText, 15, y + 7);
        
        y += 7 + (splitText.length * 7);
        
        // Add some space between items
        if (index < contenido.length - 1) {
            y += 5;
        }
    });
    
    // Agregar pie de página con marca MIVRA
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("MIVRA - personas + process - Documento generado el " + new Date().toLocaleDateString(), 105, 285, { align: 'center' });
    
    // Guardar PDF
    const fileName = `MIVRA_${titulo.replace(/\s+/g, '_')}_${empresaNombre.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
    
    // Registrar documento y actividad
    const nuevoDocumento = {
        id: Date.now().toString(),
        nombre: titulo,
        tipo: tipo,
        empresa: empresaNombre,
        fecha: new Date().toLocaleDateString(),
        fileName: fileName
    };
    
    documentos.push(nuevoDocumento);
    
    actividad.push({
        tipo: 'documento',
        accion: 'generado',
        objetivo: titulo,
        empresa: empresaNombre,
        fecha: new Date().toISOString().split('T')[0]
    });
    
    guardarDatos();
    loadDashboard();
    loadGeneratedDocuments();
    
    alert(`Documento "${titulo}" generado correctamente para ${empresaNombre}`);
}