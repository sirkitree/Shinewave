import Database from 'better-sqlite3';
import type { Article, PaginationParams, PaginatedResponse } from '../types/index.js';

const db = new Database('shinewave.db');

export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      url TEXT UNIQUE NOT NULL,
      source TEXT NOT NULL,
      publishedAt TEXT NOT NULL,
      fetchedAt TEXT NOT NULL,
      positivityScore REAL NOT NULL,
      imageUrl TEXT
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_articles_publishedAt ON articles(publishedAt DESC)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source)
  `);
}

export function insertArticle(article: Article): boolean {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO articles (title, description, content, url, source, publishedAt, fetchedAt, positivityScore, imageUrl)
    VALUES (@title, @description, @content, @url, @source, @publishedAt, @fetchedAt, @positivityScore, @imageUrl)
  `);

  const result = stmt.run(article);
  return result.changes > 0;
}

export function getArticles(params: PaginationParams, sources?: string[]): PaginatedResponse<Article> {
  const { page, limit } = params;
  const offset = (page - 1) * limit;

  let countQuery = 'SELECT COUNT(*) as total FROM articles';
  let dataQuery = 'SELECT * FROM articles';
  let queryParams: (string | number)[] = [];

  if (sources && sources.length > 0) {
    const placeholders = sources.map(() => '?').join(', ');
    countQuery += ` WHERE source IN (${placeholders})`;
    dataQuery += ` WHERE source IN (${placeholders})`;
    queryParams = [...sources];
  }

  dataQuery += ' ORDER BY publishedAt DESC LIMIT ? OFFSET ?';

  const countStmt = db.prepare(countQuery);
  const dataStmt = db.prepare(dataQuery);

  const countResult = countStmt.get(...queryParams) as { total: number };
  const total = countResult.total;
  const data = dataStmt.all(...queryParams, limit, offset) as Article[];

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export function getArticleById(id: number): Article | undefined {
  const stmt = db.prepare('SELECT * FROM articles WHERE id = ?');
  return stmt.get(id) as Article | undefined;
}

export function articleExists(url: string): boolean {
  const stmt = db.prepare('SELECT 1 FROM articles WHERE url = ?');
  return stmt.get(url) !== undefined;
}

export { db };
