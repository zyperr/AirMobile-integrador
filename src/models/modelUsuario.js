import { obtenerDb } from "../config/conexion.js"


const db = await obtenerDb()

class UsuarioModel{
    
    static async getAll(){
        const {rows} = await db.execute("SELECT * FROM usuarios");

        return rows
    }

    static async getbyId(id){
        const {rows} = await db.execute({
            sql: "SELECT * FROM usuarios WHERE id = ?",
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
        const {nombre,email,password,codigo_verificacion} = data
        const result =  await db.execute({
            sql: "INSERT into usuarios(nombre,email,password,codigo_verificacion) VALUES(?,?,?,?)",
            args: [nombre,email,password,codigo_verificacion]
        })

        return result;
    }

    static async updateUserPassword(id,password){
        const result = await db.execute({
            sql: "UPDATE usuarios SET password = ? WHERE id = ?",
            args: [password, id]
        })
        console.log(result)
        return result
    }


    static async actualizarVerificado(id){
        const result = await db.execute({
            sql: "UPDATE usuarios SET verificado = ?,codigo_verificacion = ? where id = ?",
            args: [true,"",id]
        })
        
        return result;
    }

}

export default UsuarioModel