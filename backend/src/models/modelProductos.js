import { obtenerDb } from "../config/conexion.js"

const db = await obtenerDb()


class ModelProductos {
    static async getAll(filtros, limit, offset) {
        try {
            let sql = "SELECT * FROM productos WHERE 1=1 AND activo = 1"
            let args = []
            let sqlOrderBy = "ORDER BY fecha_creacion DESC"; // mas recientes primeros

            if (filtros.orden === "asc") { // mas viejos primeros
                sqlOrderBy = "ORDER BY fecha_creacion asc";
            }
            if (filtros.bateriaMin) {
                sql += " AND bateria >= ?";
                // Quitamos los % y usamos exactamente el nombre filtros.bateriaMin
                args.push(Number(filtros.bateriaMin));
            }
            if (filtros.categoria) {
                sql += " AND categoria LIKE ?"
                args.push(`%${filtros.categoria}%`)
            }

            if (filtros.condicion) {
                sql += " AND condicion LIKE ?"
                args.push(`%${filtros.condicion}%`)
            }
            if (filtros.capacidad) {

                sql += " AND capacidad LIKE ?";
                args.push(`%"${filtros.capacidad}"%`);
            }

            if (filtros.precioMin) {
                sql += " AND precio >= ?";
                args.push(Number(filtros.precioMin));
            }

            // 3. Filtro por precio máximo
            if (filtros.precioMax) {
                sql += " AND precio <= ?";
                args.push(Number(filtros.precioMax));
            }

            // 4. Filtro por búsqueda de nombre (Coincidencia parcial con LIKE)
            if (filtros.busqueda) {
                sql += " AND nombre_producto LIKE ?";
                // Los % indican que puede haber cualquier texto antes o después de la palabra buscada
                args.push(`%${filtros.busqueda}%`);
            }


            sql += ` ${sqlOrderBy} LIMIT ? OFFSET ?`;

            // NOTA : Estos parametros siempre se pasan al final de la consulta de los filtros.
            //Empujamos los ultimos parametros de paginacion 
            args.push(limit, offset);

            const result = await db.execute({
                sql: sql,
                args: args
            });
            return result.rows
        } catch (err) {
            console.error("Error en ProductoModel.getAll:", err);
            throw err;
        }
    }

    static async countProductos(filtros) {
        try {
            let sql = "SELECT COUNT(*) as total FROM productos WHERE 1=1 AND activo = 1"
            let args = []



            if (filtros.categoria) {
                sql += " AND categoria LIKE ?"
                args.push(`%${filtros.categoria}%`)
            }

            if (filtros.capacidad) {
                // Buscamos que el JSON contenga exactamente "16GB" (con todo y comillas)
                sql += " AND capacidad LIKE ?";
                args.push(`%"${filtros.capacidad}"%`);
            }

            if (filtros.condicion) {
                sql += " AND condicion LIKE ?"
                args.push(`%${filtros.condicion}%`)
            }

            if (filtros.bateriaMin) {
                sql += " AND bateria >= ?";
                args.push(Number(filtros.bateriaMin));
            }

            if (filtros.precioMin) {
                sql += " AND precio >= ?";
                args.push(Number(filtros.precioMin));
            }

            // 3. Filtro por precio máximo
            if (filtros.precioMax) {
                sql += " AND precio <= ?";
                args.push(Number(filtros.precioMax));
            }

            // 4. Filtro por búsqueda de nombre (Coincidencia parcial con LIKE)
            if (filtros.busqueda) {
                sql += " AND nombre_producto LIKE ?";
                // Los % indican que puede haber cualquier texto antes o después de la palabra buscada
                args.push(`%${filtros.busqueda}%`);
            }

            const result = await db.execute({
                sql: sql,
                args: args
            });
            return result.rows[0].total;


        } catch (err) {
            console.error("Error en ProductoModel.countProductos:", err);
            throw err;
        }
    }

    static async getById(id) {
        const { rows } = await db.execute({
            sql: "SELECT * FROM productos WHERE id = ? AND activo = 1",
            args: [id]
        })

        return rows[0]
    }
    static async getBotCatalog(filtros, limit, offset) {
        try {
            // Solo traemos los campos que el bot necesita para responder.
            // Excluimos: imagen_url, capacidad, fecha_creacion, activo, bateria
            // Esto reduce el payload de ~4KB a ~300 bytes por página
            let sql = `
            SELECT
                id,
                nombre_producto,
                precio,
                categoria,
                condicion,
                descripcion
            FROM productos
            WHERE activo = 1
        `;
            let args = [];

            if (filtros.categoria) {
                sql += ' AND categoria LIKE ?';
                args.push(`%${filtros.categoria}%`);
            }

            if (filtros.busqueda) {
                sql += ' AND nombre_producto LIKE ?';
                args.push(`%${filtros.busqueda}%`);
            }

            sql += ' ORDER BY fecha_creacion DESC LIMIT ? OFFSET ?';
            args.push(limit, offset);

            const result = await db.execute({ sql, args });
            return result.rows;
        } catch (err) {
            console.error('Error en ModelProductos.getBotCatalog:', err);
            throw err;
        }
    }

    static async countBotCatalog(filtros) {
        try {
            let sql = 'SELECT COUNT(*) as total FROM productos WHERE activo = 1';
            let args = [];

            if (filtros.categoria) {
                sql += ' AND categoria LIKE ?';
                args.push(`%${filtros.categoria}%`);
            }

            if (filtros.busqueda) {
                sql += ' AND nombre_producto LIKE ?';
                args.push(`%${filtros.busqueda}%`);
            }

            const result = await db.execute({ sql, args });
            return result.rows[0].total;
        } catch (err) {
            console.error('Error en ModelProductos.countBotCatalog:', err);
            throw err;
        }
    }
    static async createProduct(data) {
        const { nombre_producto, precio, categoria, condicion, descripcion, } = data
        const capacidad = JSON.stringify(data.capacidad) || [];
        const imagen_url = JSON.stringify(data.imagen_url) || [];
        const bateria = data.bateria ? data.bateria : null
        const result = await db.execute({
            sql: "INSERT INTO productos(nombre_producto,precio,capacidad,descripcion,imagen_url,categoria,condicion,bateria) VALUES(?,?,?,?,?,?,?,?)",
            args: [nombre_producto, precio, capacidad, descripcion ? descripcion : "", imagen_url, categoria.toLowerCase(), condicion, bateria]
        })

        return result;
    }

    static async getAllAdmin(filtros, limit, offset) {
        try {
            let sql = "SELECT * FROM productos WHERE 1=1"
            let args = []
            let sqlOrderBy = "ORDER BY fecha_creacion DESC";

            if (filtros.orden === "asc") {
                sqlOrderBy = "ORDER BY fecha_creacion asc";
            }
            if (filtros.bateriaMin) {
                sql += " AND bateria >= ?";
                args.push(Number(filtros.bateriaMin));
            }
            if (filtros.categoria) {
                sql += " AND categoria LIKE ?"
                args.push(`%${filtros.categoria}%`)
            }
            if (filtros.condicion) {
                sql += " AND condicion LIKE ?"
                args.push(`%${filtros.condicion}%`)
            }
            if (filtros.capacidad) {
                sql += " AND capacidad LIKE ?";
                args.push(`%"${filtros.capacidad}"%`);
            }
            if (filtros.precioMin) {
                sql += " AND precio >= ?";
                args.push(Number(filtros.precioMin));
            }
            if (filtros.precioMax) {
                sql += " AND precio <= ?";
                args.push(Number(filtros.precioMax));
            }
            if (filtros.busqueda) {
                sql += " AND nombre_producto LIKE ?";
                args.push(`%${filtros.busqueda}%`);
            }

            sql += ` ${sqlOrderBy} LIMIT ? OFFSET ?`;
            args.push(limit, offset);

            const result = await db.execute({ sql: sql, args: args });
            return result.rows
        } catch (err) {
            console.error("Error en ProductoModel.getAllAdmin:", err);
            throw err;
        }
    }

    static async countAllAdmin(filtros) {
        try {
            let sql = "SELECT COUNT(*) as total FROM productos WHERE 1=1"
            let args = []

            if (filtros.categoria) {
                sql += " AND categoria LIKE ?"
                args.push(`%${filtros.categoria}%`)
            }
            if (filtros.capacidad) {
                sql += " AND capacidad LIKE ?";
                args.push(`%"${filtros.capacidad}"%`);
            }
            if (filtros.condicion) {
                sql += " AND condicion LIKE ?"
                args.push(`%${filtros.condicion}%`)
            }
            if (filtros.bateriaMin) {
                sql += " AND bateria >= ?";
                args.push(Number(filtros.bateriaMin));
            }
            if (filtros.precioMin) {
                sql += " AND precio >= ?";
                args.push(Number(filtros.precioMin));
            }
            if (filtros.precioMax) {
                sql += " AND precio <= ?";
                args.push(Number(filtros.precioMax));
            }
            if (filtros.busqueda) {
                sql += " AND nombre_producto LIKE ?";
                args.push(`%${filtros.busqueda}%`);
            }

            const result = await db.execute({ sql: sql, args: args });
            return result.rows[0].total;
        } catch (err) {
            console.error("Error en ProductoModel.countAllAdmin:", err);
            throw err;
        }
    }

    static async restoreProduct(id) {
        try {
            const result = await db.execute({
                sql: "UPDATE productos SET activo = 1 WHERE id = ? AND activo = 0",
                args: [id]
            })

            if (result.rowsAffected === 0) {
                return { success: false, message: "No se ha encontrado el producto o ya está activo" }
            }
            return { success: true, message: "Se ha restaurado correctamente" }
        } catch (err) {
            console.error("Error al restaurar producto:", err);
            return { success: false, message: "Error interno del servidor" }
        }
    }

    static async deleteProduct(id) {
        try {

            const result = await db.execute({
                sql: "UPDATE productos SET activo = 0 WHERE id = ? ",
                args: [id]
            })

            await db.execute({
                sql: "DELETE FROM carrito WHERE producto_id = ?",
                args: [id]
            });

            if (result.rowsAffected === 0) {
                return { success: false, message: "No se ha encontrado el producto" }
            }
            return { success: true, message: "Se ha eliminado correctamente" }
        } catch (err) {
            console.error("Error al eliminar producto:", err);
            return { success: false, message: "Error interno del servidor" }
        }

    }

    static async updateProduct(id, data) {
        const keys = Object.keys(data)
        if (keys.length === 0) {
            return { success: false, message: "No hay datos para actualizar" };
        }

        const setDinamico = keys.map((key) => `${key} = ? `).join(', ');

        const argumentosDelSet = Object.values(data);


        argumentosDelSet.push(id)
        const query = `UPDATE productos SET ${setDinamico} WHERE id = ?`
        try {
            const result = await db.execute({
                sql: query,
                args: argumentosDelSet
            });

            if (result.rowsAffected === 0) {
                console.log("no cambio nada ")
                return { success: false, message: "No se ha encontrado el producto" }
            }
            console.log("si cambio algo")
            return { success: true, message: "Producto actualizado correctamente" };

        } catch (err) {
            console.error("Erorr al actualizar el producto: ", err);
            return { success: false, message: "Error interno del servidor" };
        }
    }

    static async insertMany(productosArray) {
        try {
            if (!productosArray || productosArray.length === 0) return 0;

            let insertados = 0;
            let actualizados = 0;

            for (const producto of productosArray) {
                // 1. Buscamos si ya existe un producto con ese nombre (activo o no)
                const { rows } = await db.execute({
                    sql: `SELECT id FROM productos WHERE LOWER(nombre_producto) = LOWER(?) LIMIT 1`,
                    args: [producto.nombre_producto]
                });

                if (rows.length > 0) {
                    // 2. Ya existe → actualizamos
                    const id = rows[0].id;
                    await db.execute({
                        sql: `UPDATE productos SET
                            categoria   = ?,
                            precio      = ?,
                            capacidad   = ?,
                            descripcion = ?,
                            imagen_url  = ?,
                            condicion   = ?,
                            bateria     = ?,
                            activo      = 1
                          WHERE id = ?`,
                        args: [
                            producto.categoria,
                            producto.precio,
                            JSON.stringify(producto.capacidad ?? []),
                            producto.descripcion ?? '',
                            JSON.stringify(producto.imagen_url ?? []),
                            producto.condicion,
                            producto.bateria ?? null,
                            id
                        ]
                    });
                    actualizados++;
                } else {
                    // 3. No existe → insertamos
                    await db.execute({
                        sql: `INSERT INTO productos 
                            (nombre_producto, categoria, precio, capacidad, descripcion, imagen_url, condicion, bateria, activo)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
                        args: [
                            producto.nombre_producto,
                            producto.categoria,
                            producto.precio,
                            JSON.stringify(producto.capacidad ?? []),
                            producto.descripcion ?? '',
                            JSON.stringify(producto.imagen_url ?? []),
                            producto.condicion,
                            producto.bateria ?? null,
                        ]
                    });
                    insertados++;
                }
            }

            console.log(`✅ Carga masiva: ${insertados} insertados, ${actualizados} actualizados`);
            return insertados + actualizados;

        } catch (error) {
            console.error('Error en ProductoModel.insertMany:', error);
            throw new Error('Error al insertar los productos en la base de datos.');
        }
    }
}

export default ModelProductos