const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
const list = (req, res, next) => {
  res.status(200).json({ data: orders });
};

// --------------------Validation MiddlewareStarts-------------------------------------------

// this middleware validation checks to see if there is an existing order.
const orderExists = (req, res, next) => {
  const { orderId } = req.params;

  const foundOrder = orders.find((order) => order.id === orderId);

  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }

  next({
    status: 404,
    message: `${orderId}`,
  });
};

// Checks to see if the create and update function have deliverTo,and mobileNumber.
function orderPropertyExists(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({
      status: 400,
      message: `Order must include a ${propertyName}`,
    });
  };
}

// Additional validation checks to see that dishes is an array, that has a length <= 1
const dishesArrayAndLengthValidation = (req, res, next) => {
  const { data: { dishes } = {} } = req.body;

  if (!dishes) {
    next({
      status: 400,
      message: `Order must include a dish`,
    });
  } else if (dishes.length <= 0 || !Array.isArray(dishes)) {
    next({
      status: 400,
      message: `Order must include at least one dish`,
    });
  } else {
    return next();
  }
};
//Checks to make sure that the dishes in orders has a numerical value that is greater than zero.
const dishQuantityChecks = (req, res, next) => {
  const { data: { dishes } = {} } = req.body;
  dishes.map((dish, index) => {
    if (
      !dish.quantity ||
      dish.quantity === 0 ||
      Number.isInteger(dish.quantity) === false
    ) {
      next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });

  return next();
};

// Validation middleware checks to make sure orderId and id match
const orderIdValidationChecks = (req, res, next) => {
  const order = res.locals.order;
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;

  if (
    order.id !== orderId ||
    order.id === null ||
    order.id === "" ||
    order.id === undefined
  ) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    });
  }

  return next();
};

//status validation for the update middleware
const updateStatusValidationChecks = (req, res, next) => {
  const { data: { status } = {} } = req.body;

  if (!status || status === null || status === "" || status === "invalid") {
    next({
      status: 400,
      message: ` Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });
  } else if (status === "delivered") {
    next({
      status: 400,
      message: `A delivered order cannot be changed`,
    });
  } else {
    return next();
  }
};

//This validation checks to see if an id is present in the req.body and if the id matches the req.params, orderId.
const additionalOrderIdValidationChecks = (req, res, next) => {
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;

  if (id && id !== orderId) {
    next({
      status: 400,
      message: `Order id does not match route id. Dish: ${id}, Route: ${orderId}`,
    });
  } else {
    next();
  }
};

// --------------------Validation MiddlewareEnds---------------------------------------------
// Allows users to create an order
const create = (req, res, next) => {
  const { data: { deliverTo, status, mobileNumber, dishes } = {} } = req.body;

  const newOrder = {
    id: nextId(),
    deliverTo,
    status,
    mobileNumber,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
};

// recalls order from the database that has a matching orderId
const read = (req, res, next) => {
  res.status(200).json({ data: res.locals.order });
};

// updates the order with the id that matches the req.params, orderId
const update = (req, res, next) => {
  const order = res.locals.order;
  const { data: { deliverTo, status, mobileNumber, dishes } = {} } = req.body;

  order.deliverTo = deliverTo;
  order.status = status;
  order.mobileNumber = mobileNumber;
  order.dishes = dishes;

  res.status(200).json({ data: order });
};

// This middleware allows users to delete an order in the database
function destroy(req, res, next) {
  const currentOrder = res.locals.order;
  if (currentOrder.status !== "pending") {
    return next({
      status: 400,
      message: `An order cannot be deleted unless it is pending`,
    });
  }
  const index = orders.findIndex((order) => order.id === currentOrder.id);
  orders.splice(index, 1);
  res.sendStatus(204);
}
module.exports = {
  list,

  create: [
    orderPropertyExists("deliverTo"),
    orderPropertyExists("mobileNumber"),
    dishesArrayAndLengthValidation,
    dishQuantityChecks,
    create,
  ],

  update: [
    orderExists,
    orderPropertyExists("deliverTo"),
    orderPropertyExists("mobileNumber"),
    dishesArrayAndLengthValidation,
    dishQuantityChecks,
    orderIdValidationChecks,
    additionalOrderIdValidationChecks,
    updateStatusValidationChecks,
    update,
  ],

  read: [orderExists, read],

  delete: [orderExists, destroy],
};
