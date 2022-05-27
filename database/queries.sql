CREATE TABLE users (
  user_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR (60) NOT NULL,
  apellido VARCHAR (60) NOT NULL,
  username VARCHAR (60) NOT NULL,
  password VARCHAR (60) NOT NULL,
  domicilio VARCHAR (100) NOT NULL,
  email VARCHAR(60) UNIQUE NOT NULL ,
  phone VARCHAR(60) NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  is_disabled BOOLEAN DEFAULT FALSE
);

CREATE TABLE products (
  product_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR (60) NOT NULL,
  description VARCHAR(60) NOT NULL,
  precio INT NOT NULL
);

CREATE TABLE orders (
  order_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  status VARCHAR (60) NOT NULL,
  total INT NOT NULL,
  payment_method VARCHAR (60) NOT NULL,
  date DATETIME NOT NULL,
  description VARCHAR (60)NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE order_products (
  order_product_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  product_amount INT NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(order_id),
  FOREIGN KEY(product_id) REFERENCES products(product_id)
 
);


INSERT INTO
  users
VALUES(
  NULL,
  "Pepe Jr",
  "Grillo",
  "pepGrillo",
  "Pepe123",
  "Calle Falsa 1234",
  "pepgrillo@gmail.com",
  "3515054767",
  1,
  0
);
INSERT INTO
  users
VALUES(
  NULL,
  "Pepe",
  "Grillito",
  "pepGrillito",
  "Grillito123",
  "Calle Falsa 147258",
  "pepegrillito@gmail.com",
  "351987654",
  0,
  0
);
INSERT INTO
  users
VALUES(
  NULL,
  "Homero",
  "Thomson",
  "homerThomson",
  "54321Casa",
  "Calle 456",
  "homerThomson@gmail.com",
  "351987665",
  0,
  0
);
INSERT INTO
  users
VALUES(
  NULL,
  "Lalo",
  "Landa",
  "laloLanda",
  "123Casa",
  "Calle 456",
  "laloLanda@gmail.com",
  "3515054760",
  0,
  0
);

INSERT INTO
products
VALUES(
  NULL,
  "Hamburguesa Simple",
  "Medallon de carne,queso,lechuga y tomate",
  500
)
INSERT INTO
products
VALUES(
  NULL,
  "Hamburguesa Especial",
  "Medallon de carne,queso,lechuga, tomate, huevo y cebolla caramelizada",
  600
)
INSERT INTO
products
VALUES(
  NULL,
  "Pizza",
  "Muzarella y aceitunas",
  650
)

INSERT INTO
orders
VALUES(
26,
"2020-05-15 16:04:50",
5,
"NUEVO",
2300,
Tarjeta,
"1xHamSim 1xHamEsp 2xPiz"
)

INSERT INTO
orders
VALUES(
27,
2022-05-27 18:32:25,
5,
"PREPARANDO",
1700,
"Tarjeta",
"1xHamSim 2xHamEsp",
)

INSERT INTO
order_products
VALUES(
1,
26,
1,
1
)

INSERT INTO
order_products
VALUES(
  2,
26,
2,
1)

INSERT INTO
order_products
VALUES(
3,
26,
3,
2)

INSERT INTO
order_products
VALUES(
 4,
27,
1,
1)


INSERT INTO
order_products
VALUES(
5,
27,
2,
2)