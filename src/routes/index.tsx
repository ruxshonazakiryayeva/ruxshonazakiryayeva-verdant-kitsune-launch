import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const Route = createFileRoute("/")({
  server: {
    handlers: {
      GET: async () => {
        const html = await readFile(
          join(process.cwd(), "public", "invite.html"),
          "utf-8",
        );
        return new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      },
    },
  },
});
