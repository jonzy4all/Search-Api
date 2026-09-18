const { z } = require("zod");

const favoriteIdentifierSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({ identifier: z.string().trim().min(1).max(200) }),
});

const favoriteListSchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
});

module.exports = { favoriteIdentifierSchema, favoriteListSchema };
