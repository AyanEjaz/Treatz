import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { PrismaClient } from "@prisma/client";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { createContext } from "./middleware/auth.middleware";

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const wsServer = new WebSocketServer({ server: httpServer, path: "/graphql" });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        const token = (ctx.connectionParams?.authorization as string)?.split(" ")[1];
        return createContext({ token, prisma });
      },
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return { async drainServer() { await serverCleanup.dispose(); } };
        },
      },
    ],
  });

  await server.start();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization?.split(" ")[1];
        return createContext({ token, prisma });
      },
    })
  );

  const PORT = process.env.PORT || 4000;

  httpServer.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}/graphql`);
    console.log(`Subscriptions ready at ws://localhost:${PORT}/graphql`);
  });
}

startServer().catch((err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});
