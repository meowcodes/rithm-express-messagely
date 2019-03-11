const request = require("supertest");
const express = require("express");
const app = require("../app")
const db = require("../db")

// const jwt = require("jsonwebtoken")
const User = require("../models/user");
// const router = new express.Router();
// const { SECRET_KEY, BCRYPT_WORK_ROUNDS } = require("../config")
// const OPTIONS = { expiresIn: 60 * 60 }


/** 
 * POST /login - returns `{ token: '...' }`
 */

describe("POST /login success", function () {
  let auth = {};

  beforeAll(async function () {
    // User.register the new test user
    const user = await User.register({
      username: "test",
      password: "tests",
      first_name: "testfname",
      last_name: "testlname",
      phone: "5556661234"
    })
    // console.log(user)
    // Save all info into global auth 
    auth.user = user
  });

  test("returns token", async function () {
    // console.log(auth)
    const response = await request(app)
      .post(`/auth/login/`)
      .send({
        username: auth.user.username,
        password: "tests"
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  test("returns 400 for invalid credentials", async function () {
    const response = await request(app)
      .post(`/auth/login`)
      .send({
        username: auth.user.username,
        password: "wrong"
      });
    console.log("HERE",response.body)
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toEqual({
      message: "Invalid credentials", status: 400
    });
  });

  // test("returns 404 for missing inputs", async function () {
  //   const response = await request(app)
  //     .get(`/auth/login`)
  //     .send({ _token: "garbage" }); // invalid token!
  //   expect(response.statusCode).toBe(401);
  //   expect(response.body.error).toEqual({
  //     message: "Unauthorized", status: 401
  //   });
  // });

  afterAll(async function () {
    await db.query(`
      DELETE FROM users
      WHERE username='test'
    `);
  })
});