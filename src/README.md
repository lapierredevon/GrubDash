# Thinkful Project - GrubDash

### Summary

For this project I used Express.js and JavaScript to design a API that follows restful design principles and to create routes with validation middleware. This application organizes the routes by creating mini routes using separate router and controller files. The middleware and validation functions were added to the controller files and imported into the router file.

### Usage

This RESTful API can be used to build projects.

### Built With

-cors
-express

### Routes

#### /dishes

- `GET /dishes` This route returns a list of dishes existing in the database.
- `POST /dishes` This route allows users to add a new dish to the database.
- `GET /dishes/:dishId` This route will respond with the dish where id === :dishId.
- `PUT /dishes/:dishId` This route will update the dish where id === :dishId.

#### /orders

- `GET /orders` This route respond with a list of all existing order data.
- `POST /orders` This route will save a newly created order.
- `GET /orders/:orderId`This route will respond with the order where id === :orderId.
- `PUT /orders/:orderId` This route will update the order where id === :orderId.
- `DELETE /orders/:orderId` This route will delete the order and returns a 204 where id === :orderId

### Installation

1. Fork / clone this repository.
2. Run `npm install`.
3. Use `npm start` to run the application.
4. Set the API_BASE_URL environment variable to the base url for the API. If API_BASE_URL is not set, a default value of http://localhost:5000 is used.
