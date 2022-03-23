const express = require('express')
const server = express()
const sequelize = require('sequelize')
const bodyParser = require('body-parser');
const sql = new sequelize('mysql://root@localhost:3306/delilahresto')
const jwt = require('jsonwebtoken');
const { SequelizeScopeError } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET || "f1rm4$ecre7@D3lD3lilaH-R3stó"

server.use(bodyParser.json());


//=================== Middleware ===================
server.use((req, res, next) => {

    console.log(`${req.method} - ${req.path} - ${JSON.stringify(req.query)} - ${JSON.stringify(req.body)}`)
    if (req.path === '/login' || req.path === '/register' || req.path === '/')
        next();
    else {
        try {
            const token = req.headers.authorization.split(" ");
            console.log(token)
            const token_user = jwt.verify(token[1], JWT_SECRET);
            if (!!token_user) {
                req.user = token_user;

                return next();
            }
        } catch (e) {
            console.error(e.message);
            res.statusCode = 401;
            res.json({ error: "Su token no es válido, por favor inicie sesión nuevamente para continuar" });
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
        res.json({ error: "No tiene permisos para realizar esta operación" });
    }

};

//================= Registro de usuarios ==================

server.post('/register', async (req, res) => {

    try {

        const validUsername = await findData('users', 'username', req.body.username)
        const validMail = await findData('users', 'email', req.body.email)

        if (!!validUsername || !!validMail) {
            res.statusCode = 409
            res.send({ err: 'Usuario existente o correo existente' })
        }
        else {

            sql.query("INSERT into users (user_id, nombre, apellido, username, domicilio, password, email, phone, is_admin, is_disabled) values (?,?,?,?,?,?,?,?,?,?)",
                { replacements: [null, req.body.nombre, req.body.apellido, req.body.username, req.body.domicilio, req.body.password, req.body.email, req.body.phone, 0, 0] })
                .then(sqlRes => {
                    console.log(`El usuario ha sido creado con éxito: ID = ${JSON.stringify(...sqlRes)}`);
                    res.send({ Estdo: 'Usuario creado' })
                })

                .catch(e => {
                    console.log(e.message)
                    res.statusCode = 500
                    res.send({ err: 'Hubo un error' })
                })
        }
    }
    catch (error) {
        console.log(error);
        res.statusCode = 500
        res.send({ err: 'Hubo un error' })
    }

});


//=================== Login de usuarios ===================

server.get('/login', async (req, res) => {
    // console.log(req)

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
            res.send({ err: 'Usuario existente o correo existente' })
        })
});


//=========================================================
//======================== PRODUCTOS ======================
//=========================================================

//=================== Obtener productos ===================
server.get('/products', async (req, res) => {

    await sql.query('SELECT * FROM products', { type: sequelize.QueryTypes.SELECT })
        .then(products => {
            if (products.length === 0) {
                console.log('No hay productos en Delilah Restó');
                res.json({ text: 'No hay productos en Delilah Restó`', products: [] })
            }
            else {
                console.log(`Estos son los productos de Delilah Restó: ${JSON.stringify(products)}`);
                res.json({ text: 'Estos son los productos de Delilah Restó', products: products })
            }
        })
});

//====================== Crear productos ==================

server.post('/products', isAdmin, (req, res) => {

    sql.query('INSERT into products (product_id, nombre, description, precio) VALUES (?,?,?,?)',
        { replacements: [null, req.body.nombre, req.body.description, req.body.precio] })
        .then(sqlRes => {
            console.log(`El producto ha sido creado con éxito: ${sqlRes}`);
            res.statusCode = 201;
            res.json({ text: 'El producto se creó correctamente' });
        })
        .catch(err => {

            res.statusCode = 400;
            console.error(`${err.message}\nEl producto no pudo ser creado, verifique la información e intente nuevamente`);
            res.json({ error: 'El producto no pudo ser creado, verifique la información e intente nuevamente' });
        })
});

//===================== Modificar producto ==================

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
            res.json({ error: 'El producto no pudo ser modificado, verifique la información e intente nuevamente' });
            throw (`${err.message}\nEl producto no pudo ser modificado, verifique la información e intente nuevamente`);
        })
});

//===================== Eliminar producto ===================

server.delete('/products/:id', isAdmin, (req, res) => {
    const product_id = req.params.id;

    sql.query('DELETE FROM products WHERE product_id = ?',
        { replacements: [product_id] })
        .then(sqlRes => {
            console.log(`El producto ha sido eliminado con éxito: ${sqlRes}`);
            res.statusCode = 204;
            res.json({ text: 'El producto se eleminó' });
        })
        .catch(err => {

            res.statusCode = 400;
            res.json({ error: 'El producto no pudo ser modificado, verifique la información e intente nuevamente' });
            throw (`${err.message}\nEl producto no pudo ser modificado, verifique la información e intente nuevamente`);
        })
});

//=======================================================
//======================== ORDENES ======================
//=======================================================
// crear, listar, cambiar estado,  

//===================== Crear orden (pedido) ===================

server.post('/order', async (req, res) => {
    try {
        const params = req

        const productids = req.body.productos.map(idProd => idProd[0])
        const productQty = req.body.productos.map(qty => qty[1])
        let productsDetail = await Promise.all(productids.map(prodId => findData('products', 'product_id', prodId)))

        const orderData = () =>{ 
            let total = 0
            let description 
            productsDetail.forEach( (product,index ) =>{
            total += product.precio * req.body.productos[index]
        })
                  
        
        return total
        };
        // let resumen = productsDetail.forEach((product,index)=>{
        //     if(product.description.split(' '))


        // });
     
        console.log(totalPago);
        console.log(productsDetail);

        // calcular el total del pedido 
        // enviar pedido como pendiente

        res.statusCode = 200
        res.json({ text: 'Pedido recibido' })

    } catch (error) {
        console.log(error)
        res.sendStatus = 500
        res.json({ text: `Hubo un error inesperado, intente nuevamente`, er: error })
    }
});

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
    console.log('Bienvenido a la API de Delilah Restó');
});