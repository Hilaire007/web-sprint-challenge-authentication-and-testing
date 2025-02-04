// Write your tests here
const request = require("supertest");
const app = require("./server");
const db = require("../data/dbConfig");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db("users").truncate();
});

afterAll(async () => {
  await db.destroy();
});

test("sanity", () => {
  expect(true).toBe(true);
});

describe("Auth Endpoints", () => {
  beforeEach(async () => {
    await db("users").truncate();
  });

  describe("[POST] /api/auth/register", () => {
    it("returns 400 if username and password are missing", async () => {
      const res = await request(app).post("/api/auth/register").send({});
      expect(res.status).toBe(400);
      expect(res.body).toBe("username and password required");
    });

    it("registers a new user successfully", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "Captain Marvel", password: "foobar" });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.username).toBe("Captain Marvel");
      expect(res.body.password).not.toBe("foobar");
    });

    it("returns 400 if the username is already taken", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({ username: "Tony Stark", password: "ironman" });

      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "Tony Stark", password: "anotherpass" });
      expect(res.status).toBe(400);
      expect(res.body).toBe("username taken");
    });
  });

  describe("[POST] /api/auth/login", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/auth/register")
        .send({ username: "Bruce Banner", password: "hulk" });
    });

    it("returns 400 if username or password is missing", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "Bruce Banner" });
      expect(res.status).toBe(400);
      expect(res.body).toBe("username and password required");
    });

    it("logs in successfully with valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "Bruce Banner", password: "hulk" });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "welcome, Bruce Banner");
      expect(res.body).toHaveProperty("token");
    });

    it("returns 401 if credentials are invalid", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "Bruce Banner", password: "wrongpassword" });
      expect(res.status).toBe(401);
      expect(res.body).toBe("invalid credentials");
    });
  });

  describe("[GET] /api/jokes", () => {
    let token;

    beforeEach(async () => {
      await request(app)
        .post("/api/auth/register")
        .send({ username: "Steve Rogers", password: "cap" });
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "Steve Rogers", password: "cap" });
      token = res.body.token;
    });

    it("returns 401 if token is missing", async () => {
      const res = await request(app).get("/api/jokes");
      expect(res.status).toBe(401);
      expect(res.body).toBe("token required");
    });

    it("returns 200 and a list of jokes with a valid token", async () => {
      const res = await request(app)
        .get("/api/jokes")
        .set("Authorization", token);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(3);
    });

    it("returns 401 if the token is invalid", async () => {
      const res = await request(app)
        .get("/api/jokes")
        .set("Authorization", "invalidtoken");
      expect(res.status).toBe(401);
      expect(res.body).toBe("token invalid");
    });
  });
});
