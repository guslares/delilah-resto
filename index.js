const express = require('express')
const server = express()
const sequelize = require('sequelize')
const bodyParser = require('body-parser');
const sql = new sequelize('mysql://root@localhost:3306/delilahresto')
const jwt = require('jsonwebtoken');
//const { SequelizeScopeError, SMALLINT } = require('sequelize');
const text = require('body-parser/lib/types/text');

const JWT_SECRET = process.env.JWT_SECRET || "f1rm4$ecre7@D3lD3lilaH-R3stó"

server.use(bodyParser.json());


//=================== Middleware ===================
server.use((req, res, next) => {

    console.log(`${req.method} - ${req.path} - ${JSON.stringify(req.query)} - ${JSON.stringify(req.body)}`)
    if (req.path === '/user/login' || req.path === '/user' || req.path === '/')
        next();
    else {
        try {
            const token = req.headers.authorization.split(" ");
            // console.log(token)
            const token_user = jwt.verify(token[1], JWT_SECRET);
            if (!!token_user) {
                req.user = token_user;

                return next();
            }
        } catch (e) {
            console.error(e.message);
            res.statusCode = 401;
            res.json({ error: `Su token no es válido, por favor inicie sesión nuevamente para continuar` });
        }
    }
});

const isAdmin = (req, res, next) => {
    const token = req.headers.authorization.split(" ");
    const token_user = jwt.verify(token[1], JWT_SECRET);
    console.log(!!token_user.is_admin)

    if (token_user.is_admin) {
        return next()
    }
    else {
        res.statusCode = 403;
        res.json({ error: `No tiene permisos para realizar esta operación` });
    }

};
//=========================================================
//======================== USUARIOS ======================
//=========================================================
//================= Registro de usuarios ==================

server.post('/user', async (req, res) => {

    try {

        const validUsername = await findData('users', 'username', req.body.username)
        const validMail = await findData('users', 'email', req.body.email)

        if (!!validUsername || !!validMail) {
            res.statusCode = 409
            res.send({ err: `Usuario existente o correo existente` })
        }
        else {

            sql.query("INSERT into users (user_id, nombre, apellido, username, domicilio, password, email, phone, is_admin, is_disabled) values (?,?,?,?,?,?,?,?,?,?)",
                { replacements: [null, req.body.nombre, req.body.apellido, req.body.username, req.body.domicilio, req.body.password, req.body.email, req.body.phone, 0, 0] })
                .then(sqlRes => {
                    console.log(`El usuario ha sido creado con éxito: ID = ${JSON.stringify(...sqlRes)}`);
                    res.statusCode= 201
                    res.send({ Estado: `Usuario creado` })
                })

                .catch(e => {
                    console.log(e.message)
                    res.statusCode = 500
                    res.send({ err: `Hubo un error` })
                })
        }
    }
    catch (error) {
        console.log(error);
        res.statusCode = 500
        res.send({ err: `Hubo un error` })
    }

});


//================== Login de usuarios ===================

server.get('/user/login', async (req, res) => {
    await sql.query('SELECT * FROM users WHERE (username = ? OR email= ? AND password = ?)',
        {
            replacements: [req.body.param, req.body.param, req.body.password],
            type: sequelize.QueryTypes.SELECT
        })

        .then(user => {
            const token = signToken(user[0])
            res.statusCode = 200
            res.json({ Text: `Bienvenido a Delilah Restó ${user[0].nombre}`, Token: token })
        })
        .catch(e => {
            res.statusCode = 409
            res.send({ err: `Usuario existente o correo existente` })
        })
});


//========================================================
//======================= PRODUCTOS ======================
//========================================================

//================== Obtener productos ===================
server.get('/products', async (req, res) => {

    await sql.query('SELECT * FROM products', { type: sequelize.QueryTypes.SELECT })
        .then(products => {
            if (products.length === 0) {
                console.log(`No hay productos en Delilah Restó`);
                res.statusCode = 404
                res.json({ text: `No hay productos en Delilah Restó`, products: [] })
            }
            else {
                console.log(`Estos son los productos de Delilah Restó: ${JSON.stringify(products)}`);
                res.json({ text: 'Estos son los productos de Delilah Restó', products: products })
            }
        })
});

//====================== Crear productos ==================

server.post('/products', isAdmin, (req, res) => {

    sql.query('INSERT INTO products (product_id, nombre, description, precio) VALUES (?,?,?,?)',
        { replacements: [null, req.body.nombre, req.body.description, req.body.precio] })
        .then(sqlRes => {
            console.log(`El producto ha sido creado con éxito: ${sqlRes}`);
            res.statusCode = 201;
            res.json({ text: `El producto se creó correctamente` });
        })
        .catch(err => {
            res.statusCode = 400;
            console.error(`${err.message}\nEl producto no pudo ser creado, verifique la información e intente nuevamente`);
            res.json({ error: 'El producto no pudo ser creado, verifique la información e intente nuevamente' });
        })
});

//==================== Modificar producto ================

server.put('/products/:id', isAdmin, (req, res) => {
    const product_id = req.params.id
    sql.query(`UPDATE products SET nombre = ? , description = ? , precio = ? WHERE product_id = ${product_id}`,
        { replacements: [req.body.nombre, req.body.description, req.body.precio] })
        .then(sqlRes => {
            console.log(`El producto ha sido modificado con éxito: ${sqlRes}`);
            res.statusCode = 201;
            res.json({ text: `El producto ha sido modificado con éxito: ${sqlRes}` });
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({ error: `El producto no pudo ser modificado, verifique la información e intente nuevamente` });
            throw (`${err.message}\nEl producto no pudo ser modificado, verifique la información e intente nuevamente`);
        })
});

//==================== Eliminar producto =================

server.delete('/products/:id', isAdmin, (req, res) => {
    const product_id = req.params.id;

    sql.query(`DELETE FROM products WHERE product_id = ?`,
        { replacements: [product_id] })
        .then(sqlRes => {
            console.log(`El producto ha sido eliminado con éxito: ${sqlRes}`);
            res.statusCode = 204;
            res.json({ text: 'El producto se eleminó' });
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({ error: `El producto no pudo ser modificado, verifique la información e intente nuevamente` });
            throw (`${err.message}\nEl producto no pudo ser modificado, verifique la información e intente nuevamente`);
        })
});

//=======================================================
//======================== ORDENES ======================
//=======================================================


//===================== Crear pedidos ===================

server.post('/orders', async (req, res) => {
    try {
        const productids = await req.body.productos.map(idProd => idProd[0])
        const productQty = await req.body.productos.map(qty => qty[1])

        let productsDetail = await sql.query(`SELECT * FROM products WHERE product_id IN (:order_id)`,
            {
                replacements: { order_id: productids }
            })

        const orderData = async () => {
            let total = 0
            let description = ""

            productsDetail[0].forEach((product, index) => {
                total += product.precio * productQty[index]
                let main_words = product.nombre.match(/[a-zA-Z]{4,}/g);
                main_words = main_words.map(word => {
                    return word.slice(0, 3);
                })
                const product_short = String().concat('', ...main_words);

                description += `${productQty[index]}x${product_short} `
            })
            return [total, description]
        };

        const [total, description] = await orderData()


        const order = await sql.query(`INSERT into orders (order_id , user_id, status, total, payment_method, date, description) VALUES (?,?,?,?,?,?,?)`,
            { replacements: [null, req.user.user_id, 'NUEVO', total, req.body.paymenth_method, new Date(), description] })

        req.body.productos.forEach(async (product) => {
            await sql.query(`INSERT INTO order_products (order_product_id, order_id, product_id, product_amount) VALUES (?,?,?,?)`,
                { replacements: [null, order[0], product[0], product[1]] })
        })

        res.statusCode = 200
        res.json({ text: `Pedido recibido, el número de orden es ${order[0]}` })

    } catch (error) {
        console.log(error)
        res.sendStatus = 500
        res.json({ text: `Hubo un error inesperado, intente nuevamente`, er: error })
    }
});

//===================== Listar pedidos ===================
// usuarios los propios y admin todos
server.get('/orders', async (req, res) => {

    try {
        if (!!req.user.is_admin) {
            await sql.query(`SELECT orders.*, users.username , users.domicilio FROM orders 
                JOIN users ON orders.user_id`,
                { type: sequelize.QueryTypes.SELECT })
                .then(sqlRes => {
                    res.statusCode = 200
                    res.json({ data: sqlRes })
                })
        }
        else {
            await sql.query(`SELECT * FROM orders WHERE user_id = ${req.user.user_id}`,
                { type: sequelize.QueryTypes.SELECT })
                .then(sqlRes => {
                    res.statusCode = 200
                    res.json({ data: sqlRes })
                })
        }
    }
    catch (error) {
        res.statusCode = 404
        res.json({
            er: error
        })
    }
  
})
//===================== Ver pedido por ID ================
server.get('/orders/:id', async (req, res) => {
    //validar si es admin 
    const orderId = req.params.id

    try {
        if (!!req.user.is_admin) {
            await sql.query(`SELECT orders.*, users.phone, users.domicilio, users.email FROM orders LEFT JOIN users ON orders.user_id = users.user_id WHERE orders.order_id = ?`,
                { replacements: [orderId], type: sequelize.QueryTypes.SELECT })
                .then(async sqlRes => {
                    if (!!sqlRes.length) {
                        sqlRes[0].products = await sql.query(`SELECT order_products.order_id , order_products.product_amount , products.precio , products.nombre FROM order_products  LEFT JOIN products ON order_products.product_id = products.product_id WHERE order_id = ?`,
                            { replacements: [orderId], type: sequelize.QueryTypes.SELECT })
                        res.statusCode = 200
                        res.json(sqlRes[0])
                    }
                    else {
                        res.statusCode = 404
                        res.json({ text: `La orden no existe` })
                    }

                })
        }
        else {
            await sql.query(`SELECT * FROM orders WHERE order_id = ? AND user_id = ? `,
                { replacements: [orderId, req.user.user_id], type: sequelize.QueryTypes.SELECT })
                .then(async sqlRes => {
                    console.log(sqlRes)

                    if (!!sqlRes.length) {

                        sqlRes[0].products = await sql.query(`SELECT order_products.order_id , order_products.product_amount , products.precio , products.nombre FROM order_products  LEFT JOIN products ON order_products.product_id = products.product_id WHERE order_id = ?`,
                            { replacements: [orderId], type: sequelize.QueryTypes.SELECT })
                        res.statusCode = 200
                        res.json(sqlRes[0])
                    } 
                    else{
                        res.statusCode = 404
                        res.json({ text: `No se encontraron datos` })
                    }
                })
        }

    } catch (error) {
        res.statusCode = 500
        res.json({ text: `Hubo un error, detalle ${error}`})
    }
})
//================ Cambiar estado de pedido ===============

server.put('/orders/:id',isAdmin,async (req,res)=>{
  const orderId = req.params.id
  const newStatus = req.body.newStatus
    try {
       await sql.query(`UPDATE orders SET status = ? WHERE order_id =?`, 
        {replacements: [  newStatus ,orderId]})
        .then(sqlRes =>{
            console.log(sqlRes)
            res.statusCode = 200
            res.json({text: `esto es una prueba`})
        })

    } catch (error) {
        res.statusCode = 400
        res.json({text: `Hubo un error, detalle ${error}`})
    }

})
//================ Eliminar un pedido ===============

server.delete('/orders/:id',isAdmin,async (req,res)=>{
    const orderId = req.params.id
      try {
          await sql.query(`DELETE FROM orders WHERE order_id =?`, 
          {replacements: [ orderId]})
          .then(sqlRes =>{
              //affectedRows
              console.log(sqlRes)
              if(!!sqlRes[0].affectedRows){
              res.statusCode = 200
              res.json({text: `La orden fue eliminada con éxito`})
            }
            else {
                res.statusCode = 400
                res.json({text: `El pedido no existe`})
            }
          })
  
      } catch (error) {
          res.statusCode = 400
          res.json({text: `Hubo un error, detalle ${error}`})
      }
  
  })
//=========================================================
//================== Funciones auxiliares =================
async function findData(where, what, param) {
    const all = false
    const searchResults = await sql.query(`SELECT * FROM ${where} WHERE ${what} = ? `,
        { replacements: [param], type: sequelize.QueryTypes.SELECT })
    return !!searchResults.length ? (all ? searchResults : searchResults[0]) : false;
};

function signToken(data) {
    delete data.password
    // return jwt.sign(data, JWT_SECRET, { expiresIn: '30m' })
    return jwt.sign(data, JWT_SECRET)
};

server.listen(process.env.PORT || 3000, () => {
    console.log(`Bienvenido a la API de Delilah Restó`);
});