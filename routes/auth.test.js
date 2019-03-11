const request = require("supertest");
const express = require("express");
const app = require("../app")

// const jwt = require("jsonwebtoken")
const User = require("../models/user");
// const router = new express.Router();
// const { SECRET_KEY, BCRYPT_WORK_ROUNDS } = require("../config")
// const OPTIONS = { expiresIn: 60 * 60 }


/** GET /secret - returns `{ message: "You made it!" }`
 * Requirements: ensureLoginRequired
 */

describe("GET /login success", async function() {
    let auth = {};
    
    beforeAll(async function() {
        // User.register the new test user
        const user = await User.register({
            username: "test", 
            password: "tests", 
            first_name: "testfname", 
            last_name: "testlname", 
            phone: "5556661234"})
        console.log(user)
        // Save all info into global auth 
        auth.user = user
    });

    test("returns token", async function() {
      console.log(auth)
      const response = await request(app)
        .post(`/auth/login/`)
        .send({ username: auth.user.username,
                password: "tests" });
      console.log(response);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("token");
    });

    // afterAll()
  });


// describe("GET /secret failure", async function() {
//     test("returns 401 when logged out", async function() {
//       const response = await request(app)
//         .get(`/secret`); // no token being sent!
//       expect(response.statusCode).toBe(401);
//       expect(response.body.error).toEqual({
//         message: "Unauthorized", status: 401
//       });
//     });
  
//     test("returns 401 with invalid token", async function() {
//       const response = await request(app)
//         .get(`/secret`)
//         .send({ _token: "garbage"}); // invalid token!
//       expect(response.statusCode).toBe(401);
//       expect(response.body.error).toEqual({
//         message: "Unauthorized", status: 401
//       });
//     });
//   });