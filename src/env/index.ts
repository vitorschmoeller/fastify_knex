// Ele le os arquivos do .env e depois joga todos dentro de process.env
import { config } from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV === "test") {
  config({ path: ".env.test" });
} else {
  config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  DATABASE_CLIENT: z.enum(["sqlite", "pg"]),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),
});
// faz a verificação se os dados estão de acordo com a tipagem do zod, caso de erro o parse dispara
// safeparse é um método do zod que ao inves de retornar um erro, dentro dele se cria uma propriedade "success" que retorna "true" or "false"
export const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error("Invalid environment variable!", _env.error.format());

  throw new Error("Invalid environment variable");
}

export const env = _env.data;
