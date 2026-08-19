// ==========================================================================
// GLADIATOR CONTROL - LÍNEAS DE PRODUCTOS Y EQUIPAMIENTO COMPLETO (24 ÍTEMS)
// ==========================================================================

const GLADIATOR_SOLUTIONS = [
  {
    id: "controlador-modelo-501",
    category: "accesos",
    name: "Equipo Controlador para Accesos Modelo 501 Universal (Sistema TAG UHF)",
    subtitle: "Antena RFID UHF10, Tag Autoadhesivo Parabrisa UHF10 y Central Control RFID UHF10",
    badge: "Modelo 501 Top Sales",
    icon: "fa-solid fa-microchip",
    imageSvg: `<svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg">
      <!-- Background Frame -->
      <rect x="5" y="5" width="210" height="120" rx="10" fill="#0f172a" stroke="#00f2fe" stroke-width="2"/>
      
      <!-- Sheet 1: Antena -->
      <g transform="translate(15, 20)">
        <rect x="0" y="0" width="55" height="75" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
        <rect x="10" y="10" width="35" height="35" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
        <path d="M 27 20 Q 33 27 27 34 M 24 23 Q 28 27 24 31" fill="none" stroke="#2563eb" stroke-width="1.5"/>
        <text x="27" y="60" fill="#00f2fe" font-size="7" font-family="sans-serif" font-weight="bold" text-anchor="middle">ANTENA UHF10</text>
      </g>

      <!-- Sheet 2: TAG Parabrisa -->
      <g transform="translate(82, 20)">
        <rect x="0" y="0" width="55" height="75" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
        <rect x="8" y="15" width="38" height="25" rx="2" fill="#ffffff" stroke="#f59e0b" stroke-width="1"/>
        <path d="M 12 27 L 42 27" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="2,2"/>
        <text x="27" y="60" fill="#00f2fe" font-size="7" font-family="sans-serif" font-weight="bold" text-anchor="middle">TAG PARABRISA</text>
      </g>

      <!-- Sheet 3: Central -->
      <g transform="translate(150, 20)">
        <rect x="0" y="0" width="55" height="75" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
        <rect x="10" y="12" width="35" height="30" rx="3" fill="#cbd5e1" stroke="#475569" stroke-width="1"/>
        <circle cx="27.5" cy="27" r="4" fill="#10b981"/>
        <text x="27" y="60" fill="#00f2fe" font-size="7" font-family="sans-serif" font-weight="bold" text-anchor="middle">CENTRAL UHF10</text>
      </g>

      <text x="110" y="112" fill="#ffffff" font-size="9" font-family="'Outfit', sans-serif" font-weight="bold" text-anchor="middle">SOLUCIÓN INTEGRAL RFID UHF 10</text>
    </svg>`,
    description: "Sistema perfeccionado de Control de Acceso por medio de TAGs autoadhesivos de alta frecuencia al vidrio del vehículo. Compuesto por la Antena RFID UHF10, el Tag Autoadhesivo de Parabrisa UHF10 y la Central Control RFID UHF10.",
    specs: {
      "Frecuencia Trabajo": "865 - 928 MHz (UHF EPC Class 1 GEN 2 / ISO 18000-6C)",
      "Alcance Lectura": "Hasta 7 metros a velocidad pasada 2 km/h",
      "Memoria Central": "200.000 eventos y 20.000 usuarios",
      "Capacidad Puertos": "4 Puertos de Acceso / Egreso Wiegand & RS-485",
      "Protección Antena": "Exterior polarizada sellada para intemperie IP65",
      "Alimentación": "12 VDC / 4 Ah (Central) | 12 VDC 2.5 Kg (Antena)"
    },
    datasheets: [
      {
        title: "SISTEMA TAG UHF - ANTENA RFID UHF 10",
        type: "ANTENA RFID UHF 10",
        badgeColor: "#00f2fe",
        icon: "fa-solid fa-tower-cell",
        imageSvg: `<svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="20" width="100" height="100" rx="12" fill="#f8fafc" stroke="#64748b" stroke-width="3"/>
          <rect x="35" y="30" width="80" height="80" rx="8" fill="#e2e8f0"/>
          <path d="M 75 55 A 15 15 0 0 1 75 95 M 75 65 A 8 8 0 0 1 75 85" fill="none" stroke="#2563eb" stroke-width="3.5" stroke-linecap="round"/>
          <circle cx="75" cy="75" r="3" fill="#2563eb"/>
          <rect x="70" y="120" width="10" height="25" fill="#475569"/>
        </svg>`,
        features: [
          "Antena de exterior polarizada, sellada para intemperie IP65",
          "Frecuencia de trabajo 865-928 MHz",
          "Lectura TAG UHF, ISO 18000-6C, EPC Class 1 GEN 2",
          "Rango lectura hasta 7 metros, velocidad pasada 2 km/h",
          "Comunicación Wiegand 26",
          "Para trabajo con Central de Control RFID Gladiator",
          "Medidas: 260 * 260 * 90 mm",
          "Voltaje: 12 VDC, Peso: 2,5 Kg",
          "Usos: Flujo de vehículos, Control acceso, administración de Containers, Pallets, etc."
        ]
      },
      {
        title: "TAG UHF LARGO ALCANCE AUTOADHESIVO PARA PARABRISA UHF10",
        type: "TAG PARABRISA UHF10",
        badgeColor: "#f59e0b",
        icon: "fa-solid fa-tags",
        imageSvg: `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
          <rect x="15" y="20" width="130" height="80" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
          <rect x="25" y="30" width="110" height="60" rx="4" fill="#fffbe7" stroke="#f59e0b" stroke-width="1.5"/>
          <path d="M 35 60 Q 55 40 80 60 Q 105 80 125 60" fill="none" stroke="#b45309" stroke-width="2.5"/>
          <path d="M 125 30 L 145 50 L 145 30 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
          <text x="80" y="105" fill="#b45309" font-size="8" font-family="monospace" text-anchor="middle">UHF TAG ADHESIVO</text>
        </svg>`,
        features: [
          "Etiqueta de papel tecnológica RFID UHF autoadhesiva",
          "Antena: Cobre de alta conductividad",
          "Medidas: 86 x 54 mm",
          "Grosor: 0,38 mm",
          "Material: Papel y cobre laminado",
          "Frecuencia: UHF",
          "Protocolos: ISO 14443 15693 11784 A, EPC"
        ]
      },
      {
        title: "SISTEMA TAG UHF - CENTRAL RFID UHF 10",
        type: "CENTRAL CONTROL RFID UHF 10",
        badgeColor: "#10b981",
        icon: "fa-solid fa-microchip",
        imageSvg: `<svg viewBox="0 0 160 130" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="25" width="120" height="85" rx="8" fill="#e2e8f0" stroke="#475569" stroke-width="3"/>
          <rect x="35" y="15" width="15" height="10" fill="#94a3b8"/>
          <rect x="60" y="15" width="15" height="10" fill="#94a3b8"/>
          <rect x="85" y="15" width="15" height="10" fill="#94a3b8"/>
          <rect x="110" y="15" width="15" height="10" fill="#94a3b8"/>
          <text x="80" y="65" fill="#1e293b" font-size="10" font-family="'Outfit', sans-serif" font-weight="bold" text-anchor="middle">CENTRAL RFID UHF</text>
          <circle cx="45" cy="85" r="4" fill="#10b981"/>
          <circle cx="65" cy="85" r="4" fill="#3b82f6"/>
        </svg>`,
        features: [
          "Central de control para trabajo Standalone o en RED",
          "4 Puertos de Acceso / Egreso",
          "Para operación con lectores RFID / RFID UHF Wiegand",
          "Memoria 200.000 eventos, 20.000 usuarios",
          "Comunicación RS-485, TCP / IP",
          "Para trabajo con Central de Control RFID Gladiator",
          "Medidas: 140 * 90 * 60 mm",
          "Voltaje: 12 VDC, 4 Ah",
          "Peso: 500 gr",
          "Usos: Flujo de vehículos, Control acceso, administración de Containers, Pallets, etc."
        ]
      }
    ]
  },
  // --- ESTACIONAMIENTO & CONTROL VEHICULAR ---
  {
    id: "equipos-estacionamiento",
    category: "estacionamiento",
    name: "Equipos para Control de Estacionamientos",
    subtitle: "Barreras vehiculares electromecánicas, tótems y máquinas de cobro",
    badge: "Estacionamiento",
    icon: "fa-solid fa-square-parking",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="65" y="20" width="70" height="115" rx="8" fill="#0f172a" stroke="#00f2fe" stroke-width="2"/>
      <rect x="75" y="32" width="50" height="30" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="100" y="51" fill="#00f2fe" font-size="10" font-family="sans-serif" text-anchor="middle">PRESIONE</text>
      <circle cx="100" cy="80" r="10" fill="#2563eb" stroke="#60a5fa" stroke-width="2"/>
    </svg>`,
    description: "Equipamiento automatizado de alta resistencia para el control de entrada, cobro y salida en estacionamientos comerciales y privados.",
    specs: {
      "Impresión QR": "Térmica rápida con corte automático",
      "Validación": "Escáner 1D/2D + Tarjetas RFID abonados",
      "Integración": "Cajeros automáticos y barreras servo"
    }
  },
  {
    id: "sistemas-lpr-placas",
    category: "estacionamiento",
    name: "Sistemas Acceso por Lectura de Placas Vehiculares",
    subtitle: "Cámaras LPR ANPR 4K para reconocimiento automático de matrículas",
    badge: "LPR 4K",
    icon: "fa-solid fa-camera-rotate",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="45" width="70" height="45" rx="6" fill="#0f172a" stroke="#00f2fe" stroke-width="2"/>
      <circle cx="85" cy="67" r="15" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="85" cy="67" r="8" fill="#00f2fe"/>
      <text x="100" y="115" fill="#38bdf8" font-size="9" font-family="monospace" text-anchor="middle">[ ABCD-12 ]</text>
    </svg>`,
    description: "Reconocimiento de patentes vehiculares en tiempo real con 99.4% de precisión para apertura instantánea de portones y barreras.",
    specs: {
      "Resolución": "4K Ultra HD 60 FPS",
      "Infrarrojo": "Visión nocturna WDR de 50 metros",
      "Modo Autónomo": "Memoria para lista blanca y negra"
    }
  },
  {
    id: "tag-uhf-vehicular",
    category: "estacionamiento",
    name: "TAG de Control Vehicular UHF",
    subtitle: "Lectura remota de parabrisas a larga distancia (hasta 12 metros)",
    badge: "TAG UHF",
    icon: "fa-solid fa-tags",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="40" width="120" height="70" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <path d="M 60 75 Q 80 55 100 75 Q 120 95 140 75" fill="none" stroke="#00f2fe" stroke-width="3"/>
    </svg>`,
    description: "Antenas lectoras y adhesivos TAG UHF para ingreso automatizado de residentes y flota corporativa sin bajar la ventana del vehículo.",
    specs: {
      "Distancia de Lectura": "Hasta 12 metros de alcance",
      "Frecuencia": "UHF 860-960 MHz ISO18000-6C",
      "Montaje": "Antenas intemperie IP67 resistentes a lluvia"
    }
  },
  {
    id: "sistema-no-estacionar",
    category: "estacionamiento",
    name: "Sistema NO Estacionar",
    subtitle: "Detección y alerta sonora/visual contra vehículos mal estacionados",
    badge: "Disuasivo",
    icon: "fa-solid fa-ban",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="75" r="45" fill="#0f172a" stroke="#ef4444" stroke-width="4"/>
      <line x1="68" y1="43" x2="132" y2="107" stroke="#ef4444" stroke-width="4"/>
      <text x="100" y="82" fill="#fff" font-size="20" font-weight="bold" text-anchor="middle">E</text>
    </svg>`,
    description: "Dispositivo de vigilancia perimetral que detecta autos detenidos en zonas prohibidas, emitiendo sirena e informando a la conserjería.",
    specs: {
      "Detección": "Sensor óptico de ocupación de zona",
      "Alarma": "Sirena de 110dB + Luz estroboscópica",
      "Notificación": "Mensaje en consola de conserjería"
    }
  },
  {
    id: "bloqueo-estacionamientos",
    category: "estacionamiento",
    name: "Sistema Bloqueo de Estacionamientos",
    subtitle: "Cepos y barreras abatibles individuales de parqueo privado",
    badge: "Reserva 24/7",
    icon: "fa-solid fa-lock",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="70" width="100" height="40" rx="4" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
      <path d="M 70 70 L 100 35 L 130 70" fill="none" stroke="#f59e0b" stroke-width="3"/>
    </svg>`,
    description: "Cepo abatible automático accionado por control remoto o App para resguardar estacionamientos privados u oficiales.",
    specs: {
      "Accionamiento": "Control remoto / App smartphone",
      "Resistencia": "Soporta presión vehicular de hasta 3 toneladas",
      "Alarma": "Alarma anti-forzado integrada"
    }
  },

  // --- CONTROL DE ACCESO & BIOMETRÍA ---
  {
    id: "biometria-rostro-huella",
    category: "acceso",
    name: "Biometría Facial & Huella Dactilar",
    subtitle: "Control de acceso biométrico de alta precisión sin contacto",
    badge: "Biometría",
    icon: "fa-solid fa-fingerprint",
    image: "img/media_1786674859206.png",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="65" y="20" width="70" height="110" rx="10" fill="#0f172a" stroke="#00f2fe" stroke-width="2"/>
      <circle cx="100" cy="65" r="14" fill="none" stroke="#00f2fe" stroke-width="1.5"/>
      <text x="100" y="94" fill="#10b981" font-size="8" font-weight="bold" text-anchor="middle">ACCESO PERMITIDO</text>
    </svg>`,
    description: "Terminales faciales 3D y huella digital para control de asistencia de empleados e ingreso a áreas restringidas.",
    specs: {
      "Velocidad": "0.2 segundos por persona",
      "Capacidad": "50.000 plantillas registrables",
      "Protección": "Clasificación IP65 e impacto IK08"
    }
  },
  {
    id: "tarjetas-claves",
    category: "acceso",
    name: "Tarjetas RFID & Claves Digitales",
    subtitle: "Controladores de proximidad Mifare 13.56MHz y teclados numéricos",
    badge: "RFID / Clave",
    icon: "fa-solid fa-id-card",
    image: "img/media_1786674867344.png",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="35" width="120" height="80" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <rect x="55" y="50" width="30" height="25" fill="#f59e0b"/>
    </svg>`,
    description: "Lectores de tarjeta de proximidad sin contacto y cerraduras con clave digital para oficinas, puertas de acceso y ascensores.",
    specs: {
      "Frecuencia": "Mifare 13.56 MHz / EM 125 kHz",
      "Teclado": "Retroiluminado antivandálico touch",
      "Salida": "Relevador Wiegand universal"
    }
  },
  {
    id: "controlador-modelo-501",
    category: "acceso",
    name: "Equipo Controlador para Accesos Modelo 501 Universal",
    subtitle: "Central multidoor para control de puertas, torniquetes y portones",
    badge: "Modelo 501",
    icon: "fa-solid fa-microchip",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="35" y="25" width="130" height="100" rx="6" fill="#0f172a" stroke="#00f2fe" stroke-width="2"/>
      <rect x="45" y="35" width="30" height="20" fill="#334155"/>
      <circle cx="140" cy="45" r="4" fill="#10b981"/>
    </svg>`,
    description: "Central electrónica universal Modelo 501 de alta confiabilidad para la administración centralizada de accesos de edificios.",
    specs: {
      "Puertas Controladas": "Hasta 4 puertas / 8 lectores",
      "Conexión": "Ethernet TCP/IP y memoria offline",
      "Respaldos": "Batería de gel para cortes de luz"
    }
  },
  {
    id: "control-acceso-sia",
    category: "acceso",
    name: "Control de Accesos Sistema SIA Integrado",
    subtitle: "Plataforma de software centralizado para auditoría de accesos",
    badge: "Software SIA",
    icon: "fa-solid fa-network-wired",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="30" width="120" height="90" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    </svg>`,
    description: "Software de gestión SIA para monitorear en tiempo real quién entra y sale de las instalaciones con reportes exportables.",
    specs: {
      "Reportes": "Excel, PDF y bitácora en la nube",
      "Monitoreo": "Mapa sinóptico de puertas en vivo",
      "Multi-Sede": "Control de múltiples sucursales"
    }
  },

  // --- CONDOMINIOS & RESIDENCIAL ---
  {
    id: "sistema-condominio-seguro",
    category: "condominio",
    name: "Sistema Condominio Seguro",
    subtitle: "Plataforma integral para gestión de residentes, conserjería y visitas",
    badge: "Condominios",
    icon: "fa-solid fa-building-shield",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="30" width="120" height="90" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    </svg>`,
    description: "Ecosistema de seguridad residencial que integra biometría, apertura vía App, citofonía IP y registro de visitas.",
    specs: {
      "Pases QR": "Generación de pases para invitados",
      "Citofonía": "Conexión a celular de los propietarios",
      "Bitácora": "Registro fotográfico de ingresos"
    }
  },
  {
    id: "citofonia-interfonia",
    category: "condominio",
    name: "Citofonía & Interfonía para Condominios",
    subtitle: "Conectividad transparente entre conserjería, departamentos y residentes",
    badge: "Citofonía IP",
    icon: "fa-solid fa-phone-volume",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="60" y="25" width="80" height="100" rx="8" fill="#0f172a" stroke="#00f2fe" stroke-width="2"/>
    </svg>`,
    description: "Centrales de citofonía IP de alta definición con audio bidireccional y pantalla de video para control en portones.",
    specs: {
      "Pantalla": "Monitor táctil 7\" HD",
      "Protocolo": "SIP estándar / IP Ethernet",
      "Audio": "Cancelación activa de ruido"
    }
  },
  {
    id: "libro-id-access",
    category: "condominio",
    name: "Sistema Libro Electrónico ID ACCESS",
    subtitle: "Registro digital y escáner de cédulas de identidad / pasaportes",
    badge: "ID ACCESS",
    icon: "fa-solid fa-address-book",
    image: "img/media_1786674850872.png",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="45" y="30" width="110" height="90" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    </svg>`,
    description: "Remplazo digital del libro de papel en conserjería. Lee la cédula chilena por código PDF417 en menos de 1 segundo.",
    specs: {
      "Lectura Cédula": "Scanner PDF417 Rut chileno / Pasaporte",
      "Cumplimiento": "Ley de protección de datos personales",
      "Búsqueda": "Historial de visitas instantáneo"
    }
  },
  {
    id: "alarma-antiportonazo",
    category: "condominio",
    name: "Sistema Alarma Antiportonazo para Condominios",
    subtitle: "Activación de pánico vehicular de largo alcance y reflectores SOS",
    badge: "Antiportonazo",
    icon: "fa-solid fa-triangle-exclamation",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <polygon points="100,25 150,115 50,115" fill="#0f172a" stroke="#ef4444" stroke-width="3"/>
    </svg>`,
    description: "Protección al ingresar al condominio. Permite a los residentes encender reflectores LED y sirena preventiva desde el auto.",
    specs: {
      "Alcance Remoto": "Hasta 100 metros de distancia",
      "Reflectores": "Iluminación LED de alta potencia 200W",
      "Aviso": "Alerta instantánea en garita de guardias"
    }
  },

  // --- LOCKERS COMPUTACIONALES ---
  {
    id: "sistema-e-lockers",
    category: "lockers",
    name: "Sistema Lockers Inteligentes (e-Lockers)",
    subtitle: "Recepción y entrega automatizada de encargos, paquetería y envíos 24/7",
    badge: "e-Lockers",
    icon: "fa-solid fa-boxes-packing",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="35" y="20" width="130" height="110" rx="6" fill="#0f172a" stroke="#00f2fe" stroke-width="2"/>
    </svg>`,
    description: "Casilleros automatizados para condominios y empresas. El repartidor deposita el paquete y el usuario recibe un código SMS/QR.",
    specs: {
      "Pantalla Central": "Touchscreen 10.1\" con cámara",
      "Cerraduras": "Electromecánicas de alta resistencia",
      "Alertas": "Aviso automático vía SMS/WhatsApp"
    }
  },
  {
    id: "lockers-hospitales",
    category: "lockers",
    name: "Lockers Automatizados para Hospitales & Clínicas",
    subtitle: "Custodia de remedios, insumos médicos y pertenencias de personal",
    badge: "Salud / Lockers",
    icon: "fa-solid fa-hospital-user",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="35" y="20" width="130" height="110" rx="6" fill="#0f172a" stroke="#ef4444" stroke-width="2"/>
    </svg>`,
    description: "Módulos de lockers higiénicos para la entrega segura de fármacos y custodia de uniformes y equipos médicos.",
    specs: {
      "Superficie": "Material antibacterial de fácil limpieza",
      "Auditoría": "Trazabilidad de retiro por rut/huella",
      "Refrigeración": "Módulos opcionales para frío"
    }
  },

  // --- SOLUCIONES ESPECIALIZADAS & SEGURIDAD ---
  {
    id: "gym-app-control",
    category: "especiales",
    name: "Sistema de Control para Gimnasios (Gym App)",
    subtitle: "Molinete peatonal con control de membresías y morosidad",
    badge: "Gimnasios",
    icon: "fa-solid fa-dumbbell",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="30" width="120" height="90" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    </svg>`,
    description: "Software y torniquete integrado para validar planes vigentes, cuotas y bloquear el paso a usuarios no al día.",
    specs: {
      "Acceso": "Biometría huella/rostro o QR en celular",
      "Cobros": "Integración con pago automático mensual",
      "Aforo": "Contador de usuarios presentes en el recinto"
    }
  },
  {
    id: "colegios-interactivo",
    category: "especiales",
    name: "Sistema Control Interactivo para COLEGIOS",
    subtitle: "Torniquetes y notificación de llegada de alumnos a apoderados",
    badge: "Colegios",
    icon: "fa-solid fa-school",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="30" width="120" height="90" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    </svg>`,
    description: "Control de asistencia escolar que envía un mensaje instantáneo al celular del apoderado cuando el alumno ingresa al colegio.",
    specs: {
      "Aviso Apoderado": "Notificación WhatsApp/SMS de ingreso",
      "Credencial": "Tarjeta credencial escolar o biometría",
      "Asistencia": "Reporte directo para Inspectoría General"
    }
  },
  {
    id: "control-eventos-clubes",
    category: "especiales",
    name: "Sistema de Control para Eventos y Clubes",
    subtitle: "Torniquetes portátiles y validación ultrarrápida de tickets QR",
    badge: "Eventos",
    icon: "fa-solid fa-ticket",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="30" width="120" height="90" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    </svg>`,
    description: "Validadores móviles de alto flujo para eventos masivos, estadios y discoteques con lectura QR anti-clonación.",
    specs: {
      "Velocidad": "Hasta 45 personas por minuto",
      "Validación": "Tickets Puntoticket, Ticketmaster o propios",
      "Portabilidad": "Estructuras desplegables con batería"
    }
  },
  {
    id: "vehiculos-transporte",
    category: "especiales",
    name: "Control Vehículos de Transporte",
    subtitle: "Monitoreo GPS y control de choferes en buses y flotas",
    badge: "Transporte",
    icon: "fa-solid fa-bus",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="30" width="120" height="90" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    </svg>`,
    description: "Validador de pasajeros y sistema de identificación de conductores por huella dactilar en buses corporativos y de transporte.",
    specs: {
      "Identificación": "Huella de chofer autorizada",
      "Conteo": "Sensor de subida/bajada de pasajeros",
      "GPS": "Ubicación en mapa en tiempo real"
    }
  },

  // --- CCTV & VIGILANCIA REMOTA ---
  {
    id: "cctv-inteligente-placas",
    category: "cctv",
    name: "Sistema CCTV Inteligente Placas - Rostros",
    subtitle: "Videovigilancia con analítica de IA para búsqueda inmediata",
    badge: "CCTV IA",
    icon: "fa-solid fa-video",
    image: "img/media_1786674855275.png",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <path d="M 60 50 A 40 40 0 0 1 140 50 Z" fill="#1e293b" stroke="#00f2fe" stroke-width="2"/>
    </svg>`,
    description: "Circuito cerrado de televisión inteligente que permite buscar eventos por número de patente o rostro en segundos.",
    specs: {
      "Resolución": "Cámaras IP 4K Starlight visión nocturna",
      "Grabador": "NVR Industrial con RAID de discos",
      "Búsqueda": "Filtro por color de auto, género y rostro"
    }
  },
  {
    id: "cctv-lpr-asaltos",
    category: "cctv",
    name: "Sistema CCTV LPR Respuesta Rápida contra Asaltos",
    subtitle: "Botón SOS con captura de cámara y transmisión al centro de control",
    badge: "Alarma LPR",
    icon: "fa-solid fa-shield-cat",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="45" width="70" height="45" rx="6" fill="#0f172a" stroke="#ef4444" stroke-width="2"/>
    </svg>`,
    description: "Cámara disuasiva con reflector led y sirena integrada que salta en videowall ante un intento de intrusión o asalto.",
    specs: {
      "Respuesta": "Transmisión en vivo en menos de 1s",
      "Audio": "Perfonía remota para ahuyentar sospechosos",
      "Sirena": "Estraboscopio y sirena de pánico"
    }
  },
  {
    id: "vigilancia-remota",
    category: "cctv",
    name: "Sistema Automatizado de Vigilancia Remota",
    subtitle: "Detección de intrusos y cruce de línea perimetral con IA",
    badge: "Vigilancia IP",
    icon: "fa-solid fa-eye",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="75" r="30" fill="#0f172a" stroke="#00f2fe" stroke-width="2"/>
    </svg>`,
    description: "Protección perimetral para parcelas, industrias y edificios. Descarta falsas alarmas creadas por perros, gatos o viento.",
    specs: {
      "Filtro IA": "Diferencia personas/autos de vegetación",
      "Notificación": "Alerta PUSH inmediata a smartphone",
      "Compatibilidad": "Conexión a centrales de monitoreo 24/7"
    }
  },

  // --- SISTEMAS MÉDICOS & DETECCIÓN DE INCENDIOS ---
  {
    id: "reloj-inteligente-medico",
    category: "salud",
    name: "Relojes Inteligentes Nivel Médico",
    subtitle: "Monitoreo constante de signos vitales para pacientes y personal",
    badge: "Salud IP",
    icon: "fa-solid fa-heart-pulse",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="75" y="40" width="50" height="70" rx="12" fill="#0f172a" stroke="#ef4444" stroke-width="2"/>
    </svg>`,
    description: "Relojes con sensores de grado médico para clínicas, residencias de adultos mayores y personal médico.",
    specs: {
      "Signos Vitales": "Frecuencia cardíaca, SpO2, Temperatura",
      "Botonera": "Botonera SOS de pánico médico",
      "Batería": "Hasta 7 días de autonomía"
    }
  },
  {
    id: "deteccion-incendios",
    category: "incendio",
    name: "Sistemas de Detección de Incendios",
    subtitle: "Centrales direccionables, detectores de humo y sirenas normadas",
    badge: "Norma NFPA",
    icon: "fa-solid fa-fire-extinguisher",
    imageSvg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="25" width="100" height="100" rx="8" fill="#991b1b" stroke="#ef4444" stroke-width="2"/>
    </svg>`,
    description: "Centrales direccionables punto a punto para detección temprana de fuego y humo en cumplimiento de las normas NFPA y chilena.",
    specs: {
      "Central": "De 1 a 8 lazos direccionables",
      "Detectores": "Humo térmico, fotosensible y CO2",
      "Respaldos": "Baterías de emergencia de 24 horas"
    }
  }
];

// Presencia Internacional
const GLADIATOR_OFFICES = [
  {
    country: "CHILE",
    flag: "🇨🇱",
    address: "Badajoz 100 Of. 502, Las Condes, Santiago",
    postalCode: "Código Postal 7560908 - Las Condes, Santiago",
    phone: "+56 9 7699 1350",
    whatsappLink: "https://api.whatsapp.com/send?phone=+56976991350",
    email: "gladiatorcontrol@gmail.com"
  },
  {
    country: "PERÚ",
    flag: "🇵🇪",
    address: "Av. Nicolás Arriola 314 Of. D 1101, Santa Catalina",
    postalCode: "Código Postal 15019 - La Victoria, Lima",
    phone: "+51 984209008",
    whatsappLink: "https://api.whatsapp.com/send?phone=+51984209008",
    email: "gladiatorcontrol@gmail.com"
  },
  {
    country: "MÉXICO",
    flag: "🇲🇽",
    address: "Atención comercial y proyectos",
    postalCode: "México",
    phone: "+52 9842387784",
    whatsappLink: "https://api.whatsapp.com/send?phone=+529842387784",
    email: "gladiatorcontrol@gmail.com"
  }
];
