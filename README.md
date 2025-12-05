# n8n Clone

Un clon de la plataforma de automatización de flujos de trabajo [n8n](https://n8n.io/), construido con Vite y tecnologías web modernas.

## 📋 Descripción

Este proyecto es una implementación de un editor visual de flujos de trabajo inspirado en n8n. Permite crear, editar y ejecutar flujos de automatización mediante una interfaz de arrastrar y soltar (drag & drop).

## 🚀 Tecnologías

- **Vite** - Build tool y dev server ultrarrápido
- **React** / **Vue** - Framework frontend (especifica el que uses)
- **TypeScript** - Tipado estático
- **React Flow** / **Vue Flow** - Librería para grafos y diagramas interactivos (si aplica)
- **Tailwind CSS** - Framework de estilos (si aplica)

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>

# Entrar al directorio
cd n8n-clone

# Instalar dependencias
npm install
# o
yarn install
# o
pnpm install
```

## 🔧 Uso

### Modo desarrollo

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build para producción

```bash
npm run build
# o
yarn build
# o
pnpm build
```

### Preview de producción

```bash
npm run preview
# o
yarn preview
# o
pnpm preview
```

## ✨ Características

- ✅ Editor visual de flujos de trabajo
- ✅ Interfaz drag & drop para conectar nodos
- ✅ Sistema de nodos personalizable
- ✅ Ejecución de flujos de trabajo
- ✅ Guardado y carga de flujos
- ⏳ Integración con APIs externas (en desarrollo)
- ⏳ Sistema de triggers y webhooks (en desarrollo)

## 🏗️ Estructura del Proyecto

```
n8n-clone/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── nodes/          # Definición de nodos
│   ├── flows/          # Lógica de flujos
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utilidades
│   └── App.tsx         # Componente principal
├── public/             # Archivos estáticos
├── index.html          # HTML principal
├── vite.config.ts      # Configuración de Vite
└── package.json        # Dependencias
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- [n8n](https://n8n.io/) - Por la inspiración y el concepto original
- [Vite](https://vitejs.dev/) - Por el excelente tooling
- La comunidad open source

## 📧 Contacto

Tu Nombre - [@tu_twitter](https://twitter.com/tu_twitter)

Link del proyecto: [https://github.com/tu-usuario/n8n-clone](https://github.com/tu-usuario/n8n-clone)
