"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.alterTable("transactions", (table) => {
        // index() é um aviso que o campo será muito utilizado
        // adicionando na tabela de transactions um novo campo after o campo "id"
        table.uuid("session_id").after("id").index();
    });
}
async function down(knex) {
    await knex.schema.alterTable("transactions", (table) => {
        table.dropColumn("session_id");
    });
}
