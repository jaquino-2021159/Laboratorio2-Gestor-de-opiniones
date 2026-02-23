'use strict';

import Cuenta from '../src/cuentas/cuenta.model.js';

// Aqui valido que los datos de la transaccion que vienen en el body esten bien
export const validateTransactionInput = (req, res, next) => {
  const { monto, tipo_transaccion, cuenta_origen, cuenta_destinatoria } = req.body;

  // Aqui verifico que el monto venga en la solicitud
  if (monto === undefined || monto === null) {
    return res.status(400).json({ success: false, message: 'Monto requerido' });
  }

  // Convierto el monto a texto y le quito espacios para validarlo mejor
  const montoStr = String(monto).trim();
  const numeroValido = /^\d+(\.\d+)?$/.test(montoStr);

  // Aqui reviso que el monto sea un numero valido (solo numeros o decimal)
  if (!numeroValido) {
    return res.status(400).json({ success: false, message: 'El monto debe ser un número válido (solo dígitos y punto decimal)' });
  }

  const montoNum = Number(monto);

  // Aqui verifico que el monto sea un numero valido y mayor que 0
  if (!Number.isFinite(montoNum) || montoNum <= 0) {
    return res.status(400).json({ success: false, message: 'Monto inválido, debe ser mayor que 0' });
  }

  // Aqui verifico que venga el tipo de transaccion
  if (!tipo_transaccion) {
    return res.status(400).json({ success: false, message: 'Tipo de transacción requerido' });
  }

  // Convierto el tipo de transaccion a mayusculas para compararlo
  const tipo = tipo_transaccion.toUpperCase();

  // Aqui reviso que el tipo de transaccion sea valido
  if (!['TRANSFERENCIA', 'DEPOSITO'].includes(tipo)) {
    return res.status(400).json({ success: false, message: 'Tipo de transacción no válido' });
  }

  // Aqui verifico que venga la cuenta destinataria
  if (!cuenta_destinatoria) {
    return res.status(400).json({ success: false, message: 'Cuenta destinataria requerida' });
  }

  // Si es transferencia tambien tiene que venir la cuenta origen
  if (tipo === 'TRANSFERENCIA' && !cuenta_origen) {
    return res.status(400).json({ success: false, message: 'Cuenta origen requerida para transferencia' });
  }

  next();
};

// Aqui valido que las cuentas existan y que haya fondos suficientes
export const validateAccountsAndFunds = async (req, res, next) => {
  try {
    const { monto, tipo_transaccion, cuenta_origen, cuenta_destinatoria } = req.body;

    // Aqui busco la cuenta destinataria en la base de datos
    const cuentaDestino = await Cuenta.findOne({ no_cuenta: cuenta_destinatoria, isActive: true });

    // Si no existe la cuenta destinataria regreso error
    if (!cuentaDestino) {
      return res.status(404).json({ success: false, message: 'Cuenta destinataria no existe' });
    }

    // Si viene cuenta origen entonces la busco y reviso los fondos
    let cuentaOrigen = null;
    if (cuenta_origen) {

      // Aqui busco la cuenta origen
      cuentaOrigen = await Cuenta.findOne({ no_cuenta: cuenta_origen, isActive: true });

      // Si no existe la cuenta origen regreso error
      if (!cuentaOrigen) {
        return res.status(404).json({ success: false, message: 'Cuenta origen no existe' });
      }

      // Aqui verifico que la cuenta origen tenga suficiente dinero
      if (Number(cuentaOrigen.saldo) < Number(monto)) {
        return res.status(400).json({ success: false, message: 'Fondos insuficientes en la cuenta origen' });
      }
    }

    // Aqui guardo las cuentas en el request para usarlas despues en el controlador
    req.cuentaOrigen = cuentaOrigen;
    req.cuentaDestino = cuentaDestino;

    next();
  } catch (error) {

    // Si pasa algun error al validar las cuentas regreso error del servidor
    return res.status(500).json({ success: false, message: 'Error al validar cuentas', error: error.message });
  }
};