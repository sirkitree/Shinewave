import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getArticles, getArticleById } from '../db/index.js';

interface NewsQuerystring {
  page?: string;
  limit?: string;
  source?: string;
}

interface NewsParams {
  id: string;
}

export async function newsRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Querystring: NewsQuerystring }>(
    '/api/news',
    async (request, reply) => {
      const page = Math.max(1, parseInt(request.query.page || '1', 10));
      const limit = Math.min(100, Math.max(1, parseInt(request.query.limit || '20', 10)));
      const source = request.query.source;

      const result = getArticles({ page, limit }, source);

      return reply.send(result);
    }
  );

  fastify.get<{ Params: NewsParams }>(
    '/api/news/:id',
    async (request, reply) => {
      const id = parseInt(request.params.id, 10);

      if (isNaN(id)) {
        return reply.status(400).send({ error: 'Invalid article ID' });
      }

      const article = getArticleById(id);

      if (!article) {
        return reply.status(404).send({ error: 'Article not found' });
      }

      return reply.send(article);
    }
  );
}
