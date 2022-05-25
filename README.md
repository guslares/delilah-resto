## Backend para "Delilah Restó", API de pedidos de comida
Proyecto número 3 de la Certificación Desarrollo Web Full Stack de Acámica

## Recursos utilizados

- Node.js
- Express
- JWT para autenticación de los usuarios
- MySQL
- Sequelize
- Body-parser

## Instalación e inicializacion del proyecto

### 1 - Clonar proyecto

Clonar el repositorio desde el [siguiente link](https://github.com/guido732/delilah-resto).

Desde la consola con el siguiente link:

`git clone https://github.com/guslares/delilah-resto .`

### 2 - Instalación de dependencias

```
npm install
```

### 3 - Creando base de datos

- Abrir XAMPP y asegurarse que el puerto sobre el cual se está ejecutando es el `3300`
- Inicializar los servicios de Apache y MySQL
- Abrir el panel de control del servicio MySQL
- Generar una nueva base de datos llamada `delilahResto` desde el panel de control
- Abrir el archivo en `/database/queries.sql` y dentro del `panel de control` de la base de datos ejecutar la serie de queries del archivo o importar el mismo.

### 4 - Iniciando el servidor

Abrir el archivo en `index.js` desde node

`node server`

### 5 - Listo para usar!

Testear los endpoints provistos desde postman para poder hacer uso de la API y base de datos generadas

(Asegurarse de seleccionar el entorno de desarrollo `Delilah Restó` para poder acceder a las variables globales)
