import { NextRequest, NextResponse } from "next/server";
import packageJson from "@/package.json";

const ALLOWED_CHECKS = new Set(["basic", "strict"]);

type HealthLogLevel = "info" | "warn" | "error";

function logHealthEvent(
  level: HealthLogLevel,
  event: string,
  details: Record<string, string | number | boolean>,
) {
  const payload = JSON.stringify({
    level,
    service: "impulso-local",
    event,
    timestamp: new Date().toISOString(),
    ...details,
  });

  if (level === "error") {
    console.error(payload);
  } else if (level === "warn") {
    console.warn(payload);
  } else {
    console.info(payload);
  }
}

function getRuntimeMeta() {
  const version = process.env.APP_VERSION?.trim() || packageJson.version;
  const environment =
    process.env.NEXT_PUBLIC_APP_ENV?.trim() || process.env.NODE_ENV || "local";
  const tokenConfigured = Boolean(process.env.HEALTHCHECK_TOKEN?.trim());

  return { version, environment, tokenConfigured };
}

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const { version, environment, tokenConfigured } = getRuntimeMeta();
  const check = request.nextUrl.searchParams.get("check") ?? "basic";

  if (!ALLOWED_CHECKS.has(check)) {
    logHealthEvent("warn", "healthcheck.invalid_parameter", {
      statusCode: 400,
      check,
      environment,
    });

    return NextResponse.json(
      {
        status: "error",
        code: "INVALID_CHECK_PARAM",
        message: "Parámetro 'check' inválido. Valores permitidos: basic, strict.",
        service: "impulso-local",
        version,
        environment,
        timestamp,
      },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  if (check === "strict" && tokenConfigured) {
    const providedToken = request.headers.get("x-healthcheck-token")?.trim();
    const expectedToken = process.env.HEALTHCHECK_TOKEN?.trim();

    if (!providedToken || providedToken !== expectedToken) {
      logHealthEvent("warn", "healthcheck.unauthorized", {
        statusCode: 401,
        check,
        environment,
        tokenProvided: Boolean(providedToken),
      });

      return NextResponse.json(
        {
          status: "error",
          code: "UNAUTHORIZED_HEALTHCHECK",
          message: "Token de verificación ausente o inválido.",
          service: "impulso-local",
          version,
          environment,
          timestamp,
        },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }
  }

  logHealthEvent("info", "healthcheck.ok", {
    statusCode: 200,
    check,
    environment,
    version,
  });

  return NextResponse.json(
    {
      status: "ok",
      service: "impulso-local",
      version,
      environment,
      timestamp,
      checks: {
        app: "ok",
        tokenConfigured,
      },
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

function methodNotAllowed(method: string) {
  const timestamp = new Date().toISOString();
  const { version, environment } = getRuntimeMeta();

  logHealthEvent("warn", "healthcheck.method_not_allowed", {
    statusCode: 405,
    method,
    environment,
  });

  return NextResponse.json(
    {
      status: "error",
      code: "METHOD_NOT_ALLOWED",
      message: `Método ${method} no permitido en /api/health. Usa GET.`,
      service: "impulso-local",
      version,
      environment,
      timestamp,
    },
    {
      status: 405,
      headers: {
        Allow: "GET",
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST() {
  return methodNotAllowed("POST");
}

export async function PUT() {
  return methodNotAllowed("PUT");
}

export async function DELETE() {
  return methodNotAllowed("DELETE");
}
