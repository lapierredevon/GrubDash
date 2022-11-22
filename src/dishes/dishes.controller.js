const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// returns a list of dishes from the database
const list = (req, res, next) => {
  res.json({ data: dishes });
};

//--------------Validation Middleware Section Begins--------------------
//Validation middleware checks to see if dish has all of the required fields.

function dishPropertyExist(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Dish must include a ${propertyName}` });
  };
}

//Additional validation ensures that price is less than 0 and its value is an integer
const priceValidation = (req, res, next) => {
  const { data: { price } = {} } = req.body;

  if (price <= 0 || !Number.isInteger(price)) {
    next({
      status: 400,
      message: `Dish must have a price that is an integer greater than 0`,
    });
  }

  return next();
};

// Checks to see if their is a dish that has a matching id to dishId. if there is the value is added to res.locals
const dishExists = (req, res, next) => {
  const { dishId } = req.params;

  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }

  next({
    status: 404,
    message: "Dish not found",
  });
};

// Additional Validation MiddleWare
const dishIdValidation = (req, res, next) => {
  const dish = res.locals.dish;
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;
  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (!foundDish) {
    next({
      status: 404,
      message: ``,
    });
  } else if (dish.id !== dishId) {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  } else if (dish.id === "") {
    next({
      status: 400,
      message: `id must be defined`,
    });
  } else {
    return next();
  }
};

//This validation checks to see if an id is present in the req.body and if the id matches the req.params, dishId.
const additionalDishIdValidation = (req, res, next) => {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;

  if (id && id !== dishId) {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  } else {
    next();
  }
};

//-------------Validation Middleware Ends-------------------------------

//this function allows a new dish to be posted to the database
const create = (req, res, next) => {
  const { data: { name, description, price, image_url } = {} } = req.body;

  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };

  dishes.push(newDish);
  res.status(201).json({ data: newDish });
};

// This middleware gets data from the database that matches dishId
const read = (req, res, next) => {
  res.status(200).json({ data: res.locals.dish });
};

// This middleware allows you to update existing data
const update = (req, res, next) => {
  const dish = res.locals.dish;
  const { data: { name, description, price, image_url, id } = {} } = req.body;

  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.status(200).json({ data: dish });
};

// This middleware deletes data from the database
const destroy = (req, res, next) => {
  const dish = res.locals.dish;
  const { dishId } = req.params;
  const index = dishes.findIndex((dish) => dish.id === dishId);
  if (index) {
    const deleteDish = dishes.splice(index, 1);
  } else {
    return next({
      status: 400,
      message: `${dishId}`,
    });
  }

  res.sendStatus(405);
};
module.exports = {
  list,

  create: [
    dishPropertyExist("name"),
    dishPropertyExist("description"),
    dishPropertyExist("price"),
    dishPropertyExist("image_url"),
    priceValidation,
    create,
  ],

  update: [
    dishExists,
    dishPropertyExist("name"),
    dishPropertyExist("description"),
    dishPropertyExist("price"),
    dishPropertyExist("image_url"),
    dishIdValidation,
    additionalDishIdValidation,
    priceValidation,
    update,
  ],

  read: [dishExists, read],

  delete: [dishExists, destroy],
};
