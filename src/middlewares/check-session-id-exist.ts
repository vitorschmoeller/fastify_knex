import { FastifyReply, FastifyRequest } from "fastify";

export async function checkSessionIdExist(
  request: FastifyRequest,
  response: FastifyReply,
) {
  const sessionId = request.cookies.sessionId;

  if (!sessionId) {
    return response.status(401).send({ error: "Unauthorized." });
  }

  // Geralmente caso tudo esteja de acordo não passamos nenhum retorno no middleware, para a execução do código continuar nas rotas/servidor
}
