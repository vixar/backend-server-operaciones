var express = require('express');


var app = express();

var mdAuth = require('../middlewares/auth');

var Cliente = require('../Models/cliente');
var Localidad = require('../Models/localidad');
// var User = require('../Models/user');


//=========================================
// Obtener Hospitales
//=========================================


app.get('/', (req, res, next) => {

    Cliente.find({})
        .populate('localidad')
        .exec(
            (err, clientes) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando clientes',
                        errors: err
                    });

                }

                res.status(200).json({
                    ok: true,
                    clientes: clientes
                });


            })

});



//=========================================
// Crear un nuevo Hospital
//=========================================

app.post('/', mdAuth.verificaToken, (req, res) => {

    // recibir peticion mediante solicitud http, entonces usamos (leer el cuerpo)
    var body = req.body;

    /* para crear un usuario o crear un objeto del modelo que creamos, entonces usamos
     las propiedades del modelo */
    var cliente = new Cliente({
        nombre: body.nombre,
        direccion: body.direccion,
        telefono: body.telefono,
        rnc: body.rnc,
        localidad: body.localidad,
        usuario: req.user._id
    });

    /* para guardarlo en la base de datos*/

    cliente.save((err, clienteSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando cliente',
                errors: err
            });

        }

        res.status(201).json({
            ok: true,
            cliente: clienteSaved,
            user: req.user.nombre
        });

    });






});


// //=========================================
// // Actualizar un Usuario
// //=========================================

app.put('/:id', mdAuth.verificaToken, (req, res) => {

    // Cómo obtener el id
    var id = req.params.id;
    var body = req.body;

    // verificar si un usuario tiene este id
    Cliente.findById(id, (err, cliente) => {



        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar cliente',
                errors: err
            });

        }

        if (!cliente) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El cliente con el id ' + id + 'no existe',
                errors: { message: 'No existe un cliente con ese ID' }
            });
        }

        cliente.nombre = body.nombre;
        cliente.direccion = body.direccion;
        cliente.telefono = body.telefono;
        cliente.rnc = body.rnc;
        cliente.localidad = body.localidad;
        cliente.usuario = req.user._id;


        cliente.save((err, clienteSaved) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar cliente',
                    errors: err
                });

            }

            res.status(200).json({
                ok: true,
                cliente: clienteSaved,
                user: req.user.nombre
            });


        });

    });

});

// //=========================================
// // Eliminar un Usuario: usando id   
// //=========================================

app.delete('/:id', mdAuth.verificaToken, (req, res) => {

    var id = req.params.id;
    var nombre = req.user.nombre;

    Cliente.findByIdAndRemove(id, (err, clienteBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar cliente con el id =>' + id,
                errors: err
            });

        }

        if (!clienteBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un cliente con ese id',
                errors: { message: 'No existe un cliente con ese id' }
            });

        }

        res.status(200).json({
            ok: true,
            cliente: clienteBorrado,
            message: 'Cliente: ' + id + ': ' + clienteBorrado.nombre + ' => ha sido eliminado de la base de datos',
            usuario: req.user.nombre
        });
    })

});






// exportaciones de rutas
module.exports = app;