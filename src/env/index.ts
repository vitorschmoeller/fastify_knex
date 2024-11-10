// Ele le os arquivos do .env e depois joga todos dentro de process.env
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
});
// faz a verificação se os dados estão de acordo com a tipagem do zod, caso de erro o parse dispara
export const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error("Invalid environment variable!", _env.error.format());

  throw new Error("Invalid environment variable");
}

export const env = _env.data;
