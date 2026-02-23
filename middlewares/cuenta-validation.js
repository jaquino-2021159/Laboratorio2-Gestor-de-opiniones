// cuenta.validation.js
export const generarNumeroCuenta = function (next) {
    try {
        // aqui "this" se refiere al documento que se está guardando en la base de datos
        // entonces puedo acceder a sus campos como no_cuenta

        // aqui verifico si el documento no tiene numero de cuenta
        if (!this.no_cuenta) {

            // aqui genero un numero aleatorio de 10 digitos para usarlo como numero de cuenta
            const nuevoNumero = Math.floor(1000000000 + Math.random() * 9000000000).toString();

            // aqui asigno el numero generado al campo no_cuenta
            this.no_cuenta = nuevoNumero;
        }

        // aqui ejecuto next() solo si existe y es una funcion
        // esto es para que el flujo del middleware continúe
        if (typeof next === 'function') {
            next();
        }

    } catch (error) {

        // si ocurre un error lo mando con next(error) si existe
        if (typeof next === 'function') {
            next(error);
        } else {

            // si no existe next entonces lanzo el error normalmente
            throw error;
        }
    }
};