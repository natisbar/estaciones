# Arquitectura de la Aplicación Angular
Esta arquitectura Angular está diseñada para ser modular, escalable y fácil de mantener. Implementa Lazy Loading para mejorar la eficiencia y el rendimiento. A continuación, se presenta una descripción detallada de la arquitectura utilizada:

## Estructura de Carpetas
La carpeta principal es "src", la cual contiene todo el código fuente de la aplicación:

#### app: 
En esta carpeta, se encuentran los archivos centrales de la aplicación.

  1. core: En esta carpeta, se alojan servicios esenciales que se comparten en toda la aplicación, como el HttpGeneralService.ts, que proporciona funcionalidades de servicio HTTP general para realizar peticiones y gestionar respuestas de manera eficiente. Tambien se organizó un servicio personalizado para el uso de modales con SweetAlert2, que facilita la presentación de mensajes y alertas de manera consistente en toda la aplicación. 
  2. feature: Esta carpeta agrupa las diferentes características de la aplicación en módulos independientes. Dada las características del frontend desarrollada, solo hay un módulo "Map", el cual es basicamente el home de la web.
  3. Shared: En esta carpeta se dejó alojada form.validator.ts, el cual tiene dos funciones para la validacion personalizada del contenido de algunos de los inputs de los formularios.
  

#### assets: 
En esta carpeta, se almacenan recursos estáticos como las imágenes de los iconos de los marcadores y todas las variaciones de estos.

#### environments:
Aquí se gestionan las configuraciones específicas para el entorno de trabajo, esto se hace específicamente en el archivo environment.ts en el que se definió el endpoint utilizado para realizar peticiones POST, GET, PUT y DELETE.

# funcionamiento de la aplicación:
Esta aplicación hace uso de la librería "ngx-leaflet" para usar OpenStreetMaps, con esta librería es posible cargar no salemente un mapa, sino definir diferentes marcadores al interior de ese mapa. Los marcadores iniciales son los traidos con una petición GET del endpoint https://62ec1a2d818ab252b6f809d5.mockapi.io/api/Stations/
La aplicación permite:
- Seleccionar un marcador existente, editarlo o eliminarlo.
- Crear un marcador nuevo.

Nota: Los cambios relacionados con edición, eliminación o agregar un nuevo marcador, reglejan de manera inmediata dichos cambios en el mapa.  
