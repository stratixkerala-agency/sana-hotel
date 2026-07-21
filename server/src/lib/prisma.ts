import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const tursoUrl = process.env.DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

let prisma: PrismaClient;

if (tursoUrl && tursoUrl.startsWith("libsql://")) {
  const libsql = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });
  const adapter = new PrismaLibSql({
    url: tursoUrl,
    authToken: tursoToken,
  });
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

export default prisma;
