/**
 * Plantillas Oficiales de Itemizado bajo Norma NCh 1156 y Estándares MINVU/MOP
 */

export const PLANTILLAS_NCH1156 = [
  {
    id: 'minvu-vivienda-tipo',
    nombre: 'Vivienda Estándar MINVU / MOP (NCh 1156)',
    descripcion: 'Itemizado completo para construcción de vivienda habitacional tipo según normativa NCh 1156/1-5.',
    porcentaje_gg: 12.0,
    porcentaje_util: 10.0,
    items: [
      // 1.0 OBRAS PRELIMINARES Y TRABAJOS PREVIOS
      { nivel: 1, codigo: '1.0', descripcion: 'OBRAS PRELIMINARES Y FAENAS PROVISIONALES' },
      { nivel: 2, codigo: '1.1', descripcion: 'Limpieza, despeje y escarpe de terreno', unidad: 'm2', cantidad: 120.0, precio_unitario: 3500 },
      { nivel: 2, codigo: '1.2', descripcion: 'Instalación de faenas y bodega de materiales', unidad: 'gl', cantidad: 1.0, precio_unitario: 650000 },
      { nivel: 2, codigo: '1.3', descripcion: 'Cierro perimetral provisorio H=2.0m', unidad: 'm', cantidad: 45.0, precio_unitario: 14500 },
      { nivel: 2, codigo: '1.4', descripcion: 'Trazado, replanteo y niveles con niveleta', unidad: 'm2', cantidad: 75.0, precio_unitario: 4200 },

      // 2.0 OBRA GRUESA
      { nivel: 1, codigo: '2.0', descripcion: 'OBRA GRUESA' },
      { nivel: 2, codigo: '2.1', descripcion: 'Excavación manual para fundaciones y cimientos', unidad: 'm3', cantidad: 28.5, precio_unitario: 18500 },
      { nivel: 2, codigo: '2.2', descripcion: 'Hormigón de emplantillado H-5 (e=5cm)', unidad: 'm3', cantidad: 3.8, precio_unitario: 85000 },
      { nivel: 2, codigo: '2.3', descripcion: 'Hormigón cimientos H-20 (90) 20/40', unidad: 'm3', cantidad: 22.0, precio_unitario: 125000 },
      { nivel: 2, codigo: '2.4', descripcion: 'Moldajes de sobrecimiento en placa terciada', unidad: 'm2', cantidad: 42.0, precio_unitario: 16500 },
      { nivel: 2, codigo: '2.5', descripcion: 'Armadura de acero A63-42H para fundaciones', unidad: 'kg', cantidad: 480.0, precio_unitario: 1950 },
      { nivel: 2, codigo: '2.6', descripcion: 'Hormigón sobrecimientos H-25', unidad: 'm3', cantidad: 8.5, precio_unitario: 135000 },
      { nivel: 2, codigo: '2.7', descripcion: 'Cama de ripio compactado e=10cm y polietileno', unidad: 'm2', cantidad: 68.0, precio_unitario: 7800 },
      { nivel: 2, codigo: '2.8', descripcion: 'Radier de hormigón H-20 e=10cm con malla C-92', unidad: 'm2', cantidad: 68.0, precio_unitario: 26500 },
      { nivel: 2, codigo: '2.9', descripcion: 'Muros de albañilería armada ladrillo tipo fiscal', unidad: 'm2', cantidad: 115.0, precio_unitario: 38000 },
      { nivel: 2, codigo: '2.10', descripcion: 'Estructura techumbre cerchas pino insigne tratado', unidad: 'm2', cantidad: 85.0, precio_unitario: 24500 },
      { nivel: 2, codigo: '2.11', descripcion: 'Cubierta plancha zinc-alum onda toledana e=0.4mm', unidad: 'm2', cantidad: 92.0, precio_unitario: 18500 },

      // 3.0 TERMINACIONES
      { nivel: 1, codigo: '3.0', descripcion: 'TERMINACIONES' },
      { nivel: 2, codigo: '3.1', descripcion: 'Revoque y estuco exterior impermeable', unidad: 'm2', cantidad: 95.0, precio_unitario: 15500 },
      { nivel: 2, codigo: '3.2', descripcion: 'Enlucido de yeso interior en muros y cielos', unidad: 'm2', cantidad: 180.0, precio_unitario: 12500 },
      { nivel: 2, codigo: '3.3', descripcion: 'Pavimento cerámico 45x45 esmaltado antideslizante', unidad: 'm2', cantidad: 68.0, precio_unitario: 22000 },
      { nivel: 2, codigo: '3.4', descripcion: 'Pintura látex y esmalte al agua 2 manos', unidad: 'm2', cantidad: 210.0, precio_unitario: 6800 },
      { nivel: 2, codigo: '3.5', descripcion: 'Puertas de acceso e interiores con marco y quincallería', unidad: 'un', cantidad: 7.0, precio_unitario: 85000 },
      { nivel: 2, codigo: '3.6', descripcion: 'Ventanas de aluminio anodizado línea 5000 con vidrio 4mm', unidad: 'un', cantidad: 8.0, precio_unitario: 95000 },

      // 4.0 INSTALACIONES
      { nivel: 1, codigo: '4.0', descripcion: 'INSTALACIONES DOMICILIARIAS' },
      { nivel: 2, codigo: '4.1', descripcion: 'Red interior agua potable fría y caliente PPR', unidad: 'gl', cantidad: 1.0, precio_unitario: 1450000 },
      { nivel: 2, codigo: '4.2', descripcion: 'Red alcantarillado sanitario PVC domiciliario y cámaras', unidad: 'gl', cantidad: 1.0, precio_unitario: 1200000 },
      { nivel: 2, codigo: '4.3', descripcion: 'Red eléctrica embutida monofásica con TDA y diferenciales', unidad: 'gl', cantidad: 1.0, precio_unitario: 1650000 },
      { nivel: 2, codigo: '4.4', descripcion: 'Suministro e instalación de artefactos sanitarios', unidad: 'un', cantidad: 3.0, precio_unitario: 165000 },
      { nivel: 2, codigo: '4.5', descripcion: 'Aseo general de entrega y retiro de escombros', unidad: 'gl', cantidad: 1.0, precio_unitario: 350000 }
    ]
  },
  {
    id: 'remodelacion-post-inspeccion',
    nombre: 'Reparación y Normalización Post-Inspección',
    descripcion: 'Itemizado de obras de reparación para subsanar observaciones de inspección técnica.',
    porcentaje_gg: 10.0,
    porcentaje_util: 10.0,
    items: [
      { nivel: 1, codigo: '1.0', descripcion: 'TRABAJOS PREVIOS Y PROTECCIONES' },
      { nivel: 2, codigo: '1.1', descripcion: 'Protección de recintos interiores y retiro de elementos', unidad: 'gl', cantidad: 1.0, precio_unitario: 180000 },
      { nivel: 2, codigo: '1.2', descripcion: 'Picado y retiro de estucos con desprendimiento', unidad: 'm2', cantidad: 25.0, precio_unitario: 8500 },

      { nivel: 1, codigo: '2.0', descripcion: 'REPARACIONES ESTRUCTURALES Y ALBAÑILERÍA' },
      { nivel: 2, codigo: '2.1', descripcion: 'Sellado y engrapado de fisuras en muros con mortero epóxico', unidad: 'm', cantidad: 18.5, precio_unitario: 24500 },
      { nivel: 2, codigo: '2.2', descripcion: 'Reparación de radier agrietado y autonivelante', unidad: 'm2', cantidad: 22.0, precio_unitario: 19500 },

      { nivel: 1, codigo: '3.0', descripcion: 'IMPERMEABILIZACIONES Y TECHUMBRES' },
      { nivel: 2, codigo: '3.1', descripcion: 'Sellado de hojalatería, canaletas y bajadas de agua', unidad: 'm', cantidad: 32.0, precio_unitario: 12000 },
      { nivel: 2, codigo: '3.2', descripcion: 'Reemplazo de planchas de cubierta dañadas', unidad: 'm2', cantidad: 16.0, precio_unitario: 21500 },

      { nivel: 1, codigo: '4.0', descripcion: 'TERMINACIONES Y PINTURAS' },
      { nivel: 2, codigo: '4.1', descripcion: 'Empastado, lijado y pintura antihumedad en recintos afectados', unidad: 'm2', cantidad: 75.0, precio_unitario: 9500 },
      { nivel: 2, codigo: '4.2', descripcion: 'Ajuste y cepillado de puertas y ventanas descalzadas', unidad: 'un', cantidad: 6.0, precio_unitario: 35000 }
    ]
  }
];
