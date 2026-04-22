import { obtenerDb } from "../config/conexion.js"


const db = await obtenerDb()

class UsuarioModel{
    
    static async getAll(){
        const {rows} = await db.execute("SELECT * FROM usuarios");

        return rows
    }

    static async getbyId(id){
        const {rows} = await db.execute({
            sql: "SELEC * FROM usuarios WHERE id = ?",
            args:[id]
        })
        return rows[0];
    }
    
    static async buscarEmail(email){
        try{
            const {rows} = await db.execute({
                sql: "SELECT * FROM usuarios where email = ?",
                args: [email]
            })

            const firstEmail = rows[0]

            return firstEmail;
        }catch(err){
            throw err
        }
    }
    static async createUser(data){
        const {nombre,email,password,rol} = data
        const result =  await db.execute({
            sql: "INSERT into usuarios(nombre,email,password,rol) VALUES(?,?,?,?)",
            args: [nombre,email,password,rol]
        })

        return result;
    }

    static async updateUserPassword(id,data){
        const {password} = data;

        const sqlQuery = `UPDATE usuarios SET password = ? WHERE id = ?`;

        
        const result = await db.execute({
            sql: sqlQuery,
            args: [password, id]
        })
        return result
    }
}

export default UsuarioModel