import type { Knex } from "knex";
// up quer dizer o que essa migration irá fazer

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("transactions", (table) => {
    // Criando um campo na tabela uuid (metódo de criação de unique id) entre aspas o nome do campo e primary() informa que é chave primária
    table.uuid("id").primary();
    table.text("title").notNullable();
    table.decimal("amount", 10, 2).notNullable();
    // DefaultTo recebe uma forma que funcione em qualquer banco de dados
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
  });
}

// down quer dizer que podemos retroceder caso de algum erro, faz ao contrario da função up
export async function down(knex: Knex): Promise<void> {
  // dropTable desfaz uma tabela criada
  await knex.schema.dropTable("transactions");
}
