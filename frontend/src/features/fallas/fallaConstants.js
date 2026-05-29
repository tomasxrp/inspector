export const CATEGORIAS_FALLAS = [
  {
    grupo: 'Estructurales',
    color: 'red',
    opciones: ['Fisuras y Grietas', 'Nivelación', 'Hundimientos'],
  },
  {
    grupo: 'Instalaciones Eléctricas',
    color: 'amber',
    opciones: ['Tablero Eléctrico', 'Enchufes e Interruptores', 'Tierra de Protección'],
  },
  {
    grupo: 'Instalaciones Sanitarias y de Gas',
    color: 'blue',
    opciones: ['Presión y Caudal', 'Filtraciones', 'Desagües', 'Gas'],
  },
  {
    grupo: 'Puertas y Ventanas',
    color: 'default', // Using default as there's no purple
    opciones: ['Cuadratura y Roce', 'Sellos y Burletes', 'Cerrajería'],
  },
  {
    grupo: 'Terminaciones y Revestimientos',
    color: 'green',
    opciones: ['Pintura y Papel Mural', 'Pisos y Cerámicas', 'Muebles (Closets y Cocina)'],
  },
];

export const getFallaColor = (categoriaName) => {
  for (const cat of CATEGORIAS_FALLAS) {
    if (cat.opciones.includes(categoriaName)) {
      return cat.color;
    }
  }
  return 'default';
};
