/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('renz_loyalty').del()
  await knex('renz_loyalty').insert([
    {"name": "John", "phone_number": 1234567890, "points": 100},
    {"name": "Jane", "phone_number": 2345678901, "points": 150},
    {"name": "Alice", "phone_number": 3456789012, "points": 200},
    {"name": "Bob", "phone_number": 4567890123, "points": 250}
  ]);
};
