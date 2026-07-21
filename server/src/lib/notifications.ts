import { Response } from "express";

interface Client {
  id: string;
  res: Response;
}

const clients: Client[] = [];

export function addClient(id: string, res: Response) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  res.write("data: {\"type\":\"connected\"}\n\n");

  clients.push({ id, res });

  res.on("close", () => {
    const index = clients.findIndex((c) => c.id === id);
    if (index !== -1) clients.splice(index, 1);
  });
}

export function broadcast(event: string, data: unknown) {
  const payload = `data: ${JSON.stringify({ type: event, ...data })}\n\n`;
  clients.forEach((client) => {
    client.res.write(payload);
  });
}

export function getClientsCount() {
  return clients.length;
}
