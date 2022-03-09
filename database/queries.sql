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