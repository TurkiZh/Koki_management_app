import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { orderStats } from '../functions/order-stats/resource';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  User: a
    .model({
      email: a.string().required(),
      name: a.string().required(),
      role: a.string().required(), // 'Admin' | 'Owner' | 'Employee'
      shopName: a.string(),
      branch: a.string(),
      phone: a.string(),
      // each user has history of orders
      order: a.hasMany('Order', 'userId'),
    })
    .authorization((allow) => [
      allow.groups(['Admin']),
      allow.groups(['Owner', 'Employee']).to(['read']),
    ]),

  Product: a
    .model({
      name: a.string().required(),
      price: a.float().required(),
      stockQuantity: a.integer().required(),
      isAvailable: a.boolean().default(true),
      imageUrl: a.string(),
      description: a.string(),
    })
    .authorization((allow) => [
      allow.groups(['Admin']),
      allow.groups(['Owner', 'Employee']).to(['read']),
      allow.guest().to(['read']),
    ]),

  Order: a
    .model({
      status: a.string().required(), // 'Pending' | 'Completed' | 'Cancelled'
      totalPrice: a.float().required(),
      deliveryDate: a.string(),
      // each order is related to a user
      userId: a.string().required(),
      user: a.belongsTo('User', 'userId'),
      // each order has multiple items
      items: a.hasMany('OrderItem', 'orderId'),
    })
    .authorization((allow) => [
      allow.groups(['Admin']),
      allow.groups(['Owner']).to(['create', 'read']),
      allow.groups(['Employee']).to(['read', 'update']),
    ]),

  OrderItem: a
    .model({
      orderId: a.id().required(),
      order: a.belongsTo('Order', 'orderId'),
      productName: a.string().required(),
      quantity: a.integer().required(),
      price: a.float().required(),
    })
    .authorization((allow) => [
      allow.groups(['Admin']),
      allow.groups(['Owner']).to(['create', 'read']),
      allow.groups(['Employee']).to(['read']),
    ]),

  getOrderStats: a
    .query()
    .returns(a.string())
    .handler(a.handler.function(orderStats))
    .authorization((allow) => [
      allow.groups(['Admin']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
