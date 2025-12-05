# Entrega Final Backend - Coderhouse

Proyecto de e-commerce desarrollado con Node.js, Express, Handlebars y MongoDB. Implementa un sistema completo de gestión de productos y carritos de compra con paginación, filtros y vistas dinámicas.

## Requisitos Previos

- **Node.js** (versión 18 o superior)
- **npm** (incluido con Node.js)
- **MongoDB Atlas** (cuenta activa y cluster configurado)

## Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd "Entrega final"
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   
   Crear un archivo `.env` en la raíz del proyecto con la siguiente estructura:
   ```env
   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/nombre-base-datos?retryWrites=true&w=majority
   PORT=8080
   ```

   Reemplazar:
   - `usuario`: Tu usuario de MongoDB Atlas
   - `password`: Tu contraseña de MongoDB Atlas
   - `cluster`: La URL de tu cluster
   - `nombre-base-datos`: El nombre de tu base de datos

## Ejecución

**Modo desarrollo (con nodemon):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor se ejecutará en `http://localhost:8080` (o el puerto especificado en `PORT`).

## Estructura del Proyecto

```
src/
 ├── app.js                    # Configuración principal de Express
 ├── routes/
 │     ├── products.router.js  # Rutas API de productos
 │     ├── carts.router.js     # Rutas API de carritos
 │     └── views.router.js     # Rutas de vistas (Handlebars)
 ├── dao/
 │     ├── models/
 │     │     ├── product.model.js  # Modelo Mongoose de Product
 │     │     └── carts.model.js    # Modelo Mongoose de Cart
 │     └── managers/
 ├── views/
 │     ├── layouts/
 │     │      └── main.handlebars
 │     ├── products.handlebars
 │     ├── productDetail.handlebars
 │     └── cart.handlebars
 └── config/
        └── database.js        # Configuración de conexión a MongoDB
```

## Endpoints de la API

### Productos

#### `GET /api/products`
Obtiene una lista paginada de productos con filtros y ordenamiento.

**Query Parameters:**
- `limit` (Number, default: 10): Cantidad de productos por página
- `page` (Number, default: 1): Número de página
- `sort` (String, opcional): Ordenamiento por precio (`asc` o `desc`)
- `query` (String, opcional): 
  - `available`: Filtra productos con `status: true`
  - `unavailable`: Filtra productos con `status: false`
  - Cualquier otro valor: Filtra por categoría

**Ejemplo:**
```
GET /api/products?limit=5&page=1&sort=asc&query=electronics
```

**Respuesta:**
```json
{
  "status": "success",
  "payload": [...],
  "totalPages": 3,
  "prevPage": null,
  "nextPage": 2,
  "page": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevLink": null,
  "nextLink": "http://localhost:8080/api/products?page=2&limit=5&sort=asc&query=electronics"
}
```

#### `GET /api/products/:pid`
Obtiene un producto específico por su ID.

**Respuesta:**
```json
{
  "status": "success",
  "payload": {
    "_id": "...",
    "title": "...",
    "description": "...",
    "price": 100,
    "code": "ABC123",
    "stock": 50,
    "category": "electronics",
    "status": true,
    "thumbnails": []
  }
}
```

#### `POST /api/products`
Crea un nuevo producto.

**Body:**
```json
{
  "title": "Producto ejemplo",
  "description": "Descripción del producto",
  "price": 99.99,
  "code": "PROD001",
  "stock": 100,
  "category": "electronics",
  "status": true,
  "thumbnails": ["url1", "url2"]
}
```

**Campos requeridos:** `title`, `price`, `code`, `stock`, `category`

### Carritos

#### `POST /api/carts`
Crea un nuevo carrito vacío.

**Respuesta:**
```json
{
  "status": "success",
  "payload": {
    "_id": "...",
    "products": []
  }
}
```

#### `GET /api/carts/:cid`
Obtiene un carrito específico con productos populados.

**Respuesta:**
```json
{
  "status": "success",
  "payload": {
    "_id": "...",
    "products": [
      {
        "product": {
          "_id": "...",
          "title": "...",
          "price": 100,
          ...
        },
        "quantity": 2
      }
    ]
  }
}
```

#### `POST /api/carts/:cid/products/:pid`
Agrega un producto al carrito. Si el producto ya existe, incrementa su cantidad.

#### `PUT /api/carts/:cid/products/:pid`
Actualiza la cantidad de un producto específico en el carrito.

**Body:**
```json
{
  "quantity": 5
}
```

#### `DELETE /api/carts/:cid/products/:pid`
Elimina un producto específico del carrito.

#### `PUT /api/carts/:cid`
Actualiza todos los productos del carrito.

**Body:**
```json
{
  "products": [
    { "product": "productId1", "quantity": 2 },
    { "product": "productId2", "quantity": 5 }
  ]
}
```

#### `DELETE /api/carts/:cid`
Vacía el carrito (elimina todos los productos).

## Vistas (Handlebars)

### `/products`
Lista paginada de productos con:
- Cards mostrando título, precio y categoría
- Enlaces a detalle de cada producto
- Navegación de paginación (Anterior/Siguiente)
- Soporte para filtros y ordenamiento mediante query parameters

### `/products/:pid`
Vista de detalle de producto que muestra:
- Título, descripción, precio y categoría
- Botón "Agregar al carrito" con funcionalidad JavaScript
- Feedback visual al agregar productos

### `/carts/:cid`
Vista del carrito que muestra:
- Lista de productos con información completa (populados)
- Cantidad de cada producto
- Mensaje cuando el carrito está vacío

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución JavaScript
- **Express**: Framework web para Node.js
- **Handlebars**: Motor de plantillas para vistas
- **MongoDB Atlas**: Base de datos NoSQL en la nube
- **Mongoose**: ODM para MongoDB
- **mongoose-paginate-v2**: Plugin de paginación para Mongoose
- **dotenv**: Gestión de variables de entorno

## Características Técnicas

- **Módulos ES6**: El proyecto utiliza `import/export` (configurado con `"type": "module"` en `package.json`)
- **Paginación**: Implementada con `mongoose-paginate-v2` para listados eficientes
- **Populate**: Uso de `populate()` para obtener datos relacionados (productos en carritos)
- **Validación**: Validación de campos requeridos en endpoints POST/PUT
- **Manejo de errores**: Try/catch en todos los endpoints con respuestas estructuradas

## Notas Importantes

- La persistencia principal se realiza mediante **MongoDB Atlas** (base de datos en la nube)
- Se utiliza **Mongoose** como ODM para interactuar con MongoDB
- La paginación está implementada con **mongoose-paginate-v2** para optimizar consultas grandes
- Las vistas utilizan **Handlebars** como motor de plantillas
- El proyecto está configurado para usar módulos ES6 (`import/export`)

