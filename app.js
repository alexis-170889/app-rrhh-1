// Datos de ejemplo para la aplicación
let empresas = JSON.parse(localStorage.getItem('empresas')) || [
    {
        id: 1,
        nombre: "TechSolutions S.A.",
        contacto: "María González",
        email: "maria@techsolutions.com",
        telefono: "+34 912 345 678",
        servicios: ["checkup", "comunicacion"],
        notas: "Interesados en taller de comunicación para todo el equipo.",
        fechaCreacion: "2023-10-15",
        ultimoContacto: "2023-11-05"
    },
    {
        id: 2,
        nombre: "DiseñoCreativo",
        contacto: "Javier Martínez",
        email: "javier@disenocreativo.es",
        telefono: "+34 645 789 123",
        servicios: ["contratacion"],
        notas: "Necesitan ayuda con su primera contratación.",
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

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadDashboard();
    loadEmpresas();
    setupEventListeners();
    loadServiceDetails();
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
        });
    });
}

// Dashboard
function loadDashboard() {
    // Estadísticas
    document.getElementById('total-empresas').textContent = empresas.length;
    
    const serviciosCount = empresas.reduce((count, empresa) => {
        return count + empresa.servicios.length;
    }, 0);
    document.getElementById('servicios-activos').textContent = serviciosCount;
    
    // Actividad reciente
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '';
    
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

// Gestión de empresas
function loadEmpresas() {
    const empresasTable = document.querySelector('#empresas-table tbody');
    empresasTable.innerHTML = '';
    
    empresas.forEach(empresa => {
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
        
        tr.innerHTML = `
            <td>${empresa.nombre}</td>
            <td>${empresa.contacto}<br>${empresa.email}<br>${empresa.telefono}</td>
            <td>${serviciosHTML}</td>
            <td>${empresa.ultimoContacto}</td>
            <td>
                <button class="btn-secondary edit-empresa" data-id="${empresa.id}">Editar</button>
                <button class="btn-secondary delete-empresa" data-id="${empresa.id}">Eliminar</button>
            </td>
        `;
        
        empresasTable.appendChild(tr);
    });
    
    // Event listeners para botones de editar y eliminar
    document.querySelectorAll('.edit-empresa').forEach(btn => {
        btn.addEventListener('click', () => editEmpresa(btn.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.delete-empresa').forEach(btn => {
        btn.addEventListener('click', () => deleteEmpresa(btn.getAttribute('data-id')));
    });
}

function addEmpresa(e) {
    e.preventDefault();
    
    const nuevaEmpresa = {
        id: document.getElementById('empresa-id').value || Date.now(),
        nombre: document.getElementById('empresa-nombre').value,
        contacto: document.getElementById('empresa-contacto').value,
        email: document.getElementById('empresa-email').value,
        telefono: document.getElementById('empresa-telefono').value,
        servicios: Array.from(document.getElementById('empresa-servicios').selectedOptions).map(opt => opt.value),
        notas: document.getElementById('empresa-notas').value,
        fechaCreacion: new Date().toISOString().split('T')[0],
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
    closeModal();
}

function editEmpresa(id) {
    const empresa = empresas.find(emp => emp.id == id);
    
    if (empresa) {
        document.getElementById('empresa-id').value = empresa.id;
        document.getElementById('empresa-nombre').value = empresa.nombre;
        document.getElementById('empresa-contacto').value = empresa.contacto;
        document.getElementById('empresa-email').value = empresa.email;
        document.getElementById('empresa-telefono').value = empresa.telefono;
        document.getElementById('empresa-notas').value = empresa.notas;
        
        // Seleccionar servicios
        const serviciosSelect = document.getElementById('empresa-servicios');
        for (let i = 0; i < serviciosSelect.options.length; i++) {
            serviciosSelect.options[i].selected = empresa.servicios.includes(serviciosSelect.options[i].value);
        }
        
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
        }
    }
}

// Servicios
function loadServiceDetails() {
    const serviceButtons = document.querySelectorAll('.service-card button');
    
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
            `;
            break;
    }
    
    serviceDetails.innerHTML = contenido;
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
    document.getElementById('add-empresa-btn').addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Añadir Nueva Empresa';
        openModal();
    });
    
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('cancel-empresa').addEventListener('click', closeModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('empresa-modal')) {
            closeModal();
        }
    });
    
    // Form submission
    document.getElementById('empresa-form').addEventListener('submit', addEmpresa);
    
    // Filtros
    document.getElementById('empresa-search').addEventListener('input', filtrarEmpresas);
    document.getElementById('servicio-filter').addEventListener('change', filtrarEmpresas);
}

function filtrarEmpresas() {
    const texto = document.getElementById('empresa-search').value.toLowerCase();
    const servicio = document.getElementById('servicio-filter').value;
    
    const empresasFiltradas = empresas.filter(empresa => {
        const coincideTexto = empresa.nombre.toLowerCase().includes(texto) || 
                             empresa.contacto.toLowerCase().includes(texto);
        
        const coincideServicio = servicio === '' || empresa.servicios.includes(servicio);
        
        return coincideTexto && coincideServicio;
    });
    
    // Actualizar tabla
    const empresasTable = document.querySelector('#empresas-table tbody');
    empresasTable.innerHTML = '';
    
    empresasFiltradas.forEach(empresa => {
        const tr = document.createElement('tr');
        
        const serviciosHTML = empresa.servicios.map(servicio => {
            let texto = '';
            switch(servicio) {
                case 'checkup': texto = 'Check-Up'; break;
                case 'comunicacion': texto = 'Comunicación'; break;
                case 'contratacion': texto = 'Contratación'; break;
            }
            return `<span class="badge">${texto}</span>`;
        }).join(' ');
        
        tr.innerHTML = `
            <td>${empresa.nombre}</td>
            <td>${empresa.contacto}<br>${empresa.email}<br>${empresa.telefono}</td>
            <td>${serviciosHTML}</td>
            <td>${empresa.ultimoContacto}</td>
            <td>
                <button class="btn-secondary edit-empresa" data-id="${empresa.id}">Editar</button>
                <button class="btn-secondary delete-empresa" data-id="${empresa.id}">Eliminar</button>
            </td>
        `;
        
        empresasTable.appendChild(tr);
    });
    
    // Reasignar event listeners a los nuevos botones
    document.querySelectorAll('.edit-empresa').forEach(btn => {
        btn.addEventListener('click', () => editEmpresa(btn.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.delete-empresa').forEach(btn => {
        btn.addEventListener('click', () => deleteEmpresa(btn.getAttribute('data-id')));
    });
}

// Guardar datos en localStorage
function guardarDatos() {
    localStorage.setItem('empresas', JSON.stringify(empresas));
    localStorage.setItem('actividad', JSON.stringify(actividad));
}

// Generación de PDFs
function generarPDF(tipo) {
    // Usar jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let contenido = [];
    let titulo = "";
    
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
    }
    
    // Agregar logo (si está disponible)
    try {
        // Esta es una aproximación, en la práctica necesitarías convertir la imagen a base64
        doc.addImage("logo.png", "PNG", 15, 15, 30, 10);
    } catch (e) {
        console.log("Logo no disponible para PDF");
    }
    
    // Configurar PDF
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80); // Color primary de MIVRA
    doc.text(titulo, 105, 25, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    let y = 40;
    contenido.forEach((item, index) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFont(undefined, 'bold');
        doc.setTextColor(230, 126, 34); // Color secondary de MIVRA
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
    doc.text("MIVRA - personas + process", 105, 285, { align: 'center' });
    
    // Guardar PDF
    doc.save(`MIVRA_${titulo}.pdf`);
    
    // Registrar actividad
    actividad.push({
        tipo: 'documento',
        accion: 'generado',
        objetivo: titulo,
        fecha: new Date().toISOString().split('T')[0]
    });
    guardarDatos();
    loadDashboard();
}