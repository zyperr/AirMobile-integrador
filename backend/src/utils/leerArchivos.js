import csv from 'csv-parser';
import { Readable } from 'stream';
import ExcelJS from 'exceljs';


const leerJson = (buffer) => {
    try {
        const texto = buffer.toString('utf-8');
        const data = JSON.parse(texto);

        if (!Array.isArray(data)) {
            throw new Error("El archivo JSON debe contener un arreglo de productos.");
        }
        console.log(data)
        return data;
    } catch (error) {
        // Lanzamos un error claro para que el controlador lo atrape
        throw new Error(error.message.includes("JSON") ? error.message : "El archivo JSON está mal formateado.");
    }
};
const leerCsv = (buffer, separador = ',') => { // Por defecto usa coma, pero podés pasarle ';'
    const a = new Promise((resolve, reject) => {
        const resultados = [];

        const contenidoTexto = buffer.toString('utf-8').replace(/^\uFEFF/, ''); ;
        //console.log(`${contenidoTexto}`)
        // 1. Convertimos el Buffer de la RAM a un Stream de lectura
        const stream = Readable.from(contenidoTexto);
        // 2. Lo pasamos por el parser de CSV
        stream
            .pipe(csv({ separator: separador })) // Acá le indicamos el separador
            .on('data', (fila) => {
                console.log(fila)
                // Cada fila del Excel/CSV llega acá como un objeto
                resultados.push(fila);
            })
            .on('end', () => {
                // Cuando termina de leer todo el archivo, resolvemos la promesa
                resolve(resultados);
            })
            .on('error', (error) => {
                reject(new Error("Error al leer el archivo CSV: " + error.message));
            });
    });

    return a;
};

const leerExcel = async (buffer) => {
    try {
        const workbook = new ExcelJS.Workbook();
        // Leemos el archivo directamente desde la memoria RAM
        await workbook.xlsx.load(buffer);

        // Agarramos la primera hoja (pestaña) del Excel
        const worksheet = workbook.worksheets[0];

        if (!worksheet) {
            throw new Error("El archivo Excel está vacío.");
        }

        const resultados = [];
        let encabezados = []; // Acá vamos a guardar los títulos de la fila 1

        // Iteramos sobre cada fila que tenga datos
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
                // Si es la fila 1, guardamos los nombres de las columnas
                row.eachCell((cell, colNumber) => {
                    // cell.value trae el texto de la celda
                    encabezados[colNumber] = cell.value;
                });
            } else {
                // De la fila 2 en adelante, armamos el objeto del producto
                let filaObj = {};
                row.eachCell((cell, colNumber) => {
                    const clave = encabezados[colNumber]; // Buscamos qué título le corresponde
                    if (clave) {
                        let valorCelda = cell.value;
                        if (valorCelda && typeof valorCelda === 'object' && valorCelda.text) {
                            valorCelda = valorCelda.text;
                        }

                        filaObj[clave] = valorCelda;
                    }
                });
                resultados.push(filaObj); // Lo agregamos a nuestra lista final
            }
        });

        return resultados;
    } catch (error) {
        throw new Error("Error al procesar el archivo Excel. Asegurate de que no esté corrupto.");
    }
};

export const procesarArchivo = async (buffer, extension, separador) => {
    switch (extension) {
        case 'json':
            // Retorna el array de productos
            return leerJson(buffer);

        case 'csv':
            return leerCsv(buffer, separador);
        case 'xlsx':
            return leerExcel(buffer);
        default:
            throw new Error("Formato no soportado. Usá .json, .csv o .xlsx");
    }
};