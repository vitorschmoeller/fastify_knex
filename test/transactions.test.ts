import { expect, test, beforeAll, afterAll, describe, it } from "vitest";
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

  it("Should be able to list all transactions", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New Transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "New Transaction",
        amount: 5000,
      }),
    ]);
  });
});
