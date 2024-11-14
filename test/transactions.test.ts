import {
  expect,
  test,
  beforeAll,
  afterAll,
  describe,
  it,
  beforeEach,
} from "vitest";
import { execSync } from "node:child_process";
import request from "supertest";
import { app } from "../src/app";

describe("Transactions routes", () => {
  // Garantindo que todos os plugins são executados antes do teste acontecer por conta da async
  beforeAll(async () => {
    // Antes de todos os testes aguarde, minha app estar pronta

    await app.ready();
  });

  afterAll(async () => {
    // Depois de todos os testes, quero remover a aplicação da memória
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --al");
    execSync("npm run knex migrate:latest");
  });
  test("User can create a new transaction", async () => {
    // o supertest deve receber o servidor como parâmetro
    // apôs o parâmetro podemos executar um método
    const response = await request(app.server).post("/transactions").send({
      title: "New Transaction",
      amount: 5000,
      type: "credit",
    });

    expect(response.statusCode).toEqual(201);
  });

  it("Should be able to list a specific transaction", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New Transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");

    if (!cookies) {
      throw new Error("No cookies were set in the response");
    }

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    const transactionId = listTransactionsResponse.body.transactions[0].id;

    const getTransactionsResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getTransactionsResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: "New Transaction",
        amount: 5000,
      }),
    );
  });

  it("Should be able to get the summary", async () => {
    const createTransactionsResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "Credit transcation",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionsResponse.get("Set-Cookie");

    if (!cookies) {
      throw new Error("Cookies undefined");
    }

    await request(app.server)
      .post("/transactions")
      .set("Cookie", cookies)
      .send({
        title: "Debit transcation",
        amount: 2000,
        type: "debit",
      });

    const summaryResponse = await request(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookies)
      .expect(200);

    expect(summaryResponse.body.summary).toEqual({
      amount: 3000,
    });
  });
});
