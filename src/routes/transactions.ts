import { randomUUID } from "node:crypto";
import { knex } from "../database";
import { z } from "zod";
import { FastifyInstance } from "fastify";
import { checkSessionIdExist } from "../middlewares/check-session-id-exist";
// Cookies <-> Formas da gente manter contexto entre requisições

export async function transactionsRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [checkSessionIdExist] }, async (request) => {
    const { sessionId } = request.cookies;

    const transactions = await knex("transactions").where(
      "session_id",
      sessionId,
    );

    return {
      transactions,
    };
  });

  app.get("/:id", { preHandler: [checkSessionIdExist] }, async (request) => {
    const { sessionId } = request.cookies;
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const params = getTransactionParamsSchema.parse(request.params);

    const transaction = await knex("transactions")
      .where("id", params.id)
      .andWhere("session_id", sessionId)
      .first();

    return {
      transaction,
    };
  });

  app.get(
    "/summary",
    { preHandler: [checkSessionIdExist] },
    async (request) => {
      const { sessionId } = request.cookies;
      // sum é o metódo que soma todos os valores de uma coluna
      const summary = await knex("transactions")
        .where("session_id", sessionId)
        .sum("amount", { as: "amount" })
        .first();

      return { summary };
    },
  );

  app.post("/", async (request, response) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    );

    // Estou procurando dentro dos cookies o sessionId, verificar se já existe
    let sessionId = request.cookies.sessionId;

    // caso esteja vazio, iremos gerar esse id
    if (!sessionId) {
      sessionId = randomUUID();

      // criando dentro de cookie um session id contendo o sessionId
      response.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId,
    });

    return response.status(201).send();
  });
}
