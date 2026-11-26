import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

describe("/api/health (verificación operativa DevOps)", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("responde 200 ok con versión, entorno y timestamp sin exponer secretos", async () => {
    process.env.APP_VERSION = "1.2.3-rc1";
    process.env.NEXT_PUBLIC_APP_ENV = "staging";
    process.env.HEALTHCHECK_TOKEN = "super-secret-token-never-log";

    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const req = new NextRequest("http://localhost:3847/api/health");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(body.status).toBe("ok");
    expect(body.service).toBe("impulso-local");
    expect(body.version).toBe("1.2.3-rc1");
    expect(body.environment).toBe("staging");
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
    expect(body.checks).toEqual({ app: "ok", tokenConfigured: true });

    const serializedBody = JSON.stringify(body);
    expect(serializedBody).not.toContain("super-secret-token-never-log");
    expect(infoSpy).toHaveBeenCalledOnce();
    expect(String(infoSpy.mock.calls[0]?.[0])).not.toContain(
      "super-secret-token-never-log",
    );
  });

  it("rechaza con 400 un parámetro check inválido y registra log estructurado", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const req = new NextRequest("http://localhost:3847/api/health?check=invalido");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.status).toBe("error");
    expect(body.code).toBe("INVALID_CHECK_PARAM");
    expect(warnSpy).toHaveBeenCalledOnce();

    const logEntry = JSON.parse(String(warnSpy.mock.calls[0]?.[0]));
    expect(logEntry.event).toBe("healthcheck.invalid_parameter");
    expect(logEntry.statusCode).toBe(400);
  });

  it("en modo strict valida x-healthcheck-token sin filtrar el secreto en errores ni logs", async () => {
    process.env.HEALTHCHECK_TOKEN = "token-secreto-ci-9876";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const unauthorizedReq = new NextRequest(
      "http://localhost:3847/api/health?check=strict",
      { headers: { "x-healthcheck-token": "token-incorrecto" } },
    );
    const unauthorizedRes = await GET(unauthorizedReq);
    const unauthorizedBody = await unauthorizedRes.json();

    expect(unauthorizedRes.status).toBe(401);
    expect(unauthorizedBody.code).toBe("UNAUTHORIZED_HEALTHCHECK");
    expect(JSON.stringify(unauthorizedBody)).not.toContain("token-secreto-ci-9876");
    expect(String(warnSpy.mock.calls[0]?.[0])).not.toContain("token-secreto-ci-9876");
    expect(String(warnSpy.mock.calls[0]?.[0])).not.toContain("token-incorrecto");

    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const validReq = new NextRequest(
      "http://localhost:3847/api/health?check=strict",
      { headers: { "x-healthcheck-token": "token-secreto-ci-9876" } },
    );
    const validRes = await GET(validReq);
    expect(validRes.status).toBe(200);
    expect(infoSpy).toHaveBeenCalledOnce();
  });

  it("responde 405 Method Not Allowed ante POST con cabecera Allow: GET", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toBe("GET");
    expect(body.status).toBe("error");
    expect(body.code).toBe("METHOD_NOT_ALLOWED");
    expect(warnSpy).toHaveBeenCalledOnce();

    const logEntry = JSON.parse(String(warnSpy.mock.calls[0]?.[0]));
    expect(logEntry.event).toBe("healthcheck.method_not_allowed");
    expect(logEntry.method).toBe("POST");
  });
});
