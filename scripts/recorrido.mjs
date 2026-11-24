import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const base = "http://127.0.0.1:3847";
const browser = await puppeteer.launch({
  executablePath: "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
page.setDefaultTimeout(15000);
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));

async function text() {
  return page.evaluate(() => document.body.innerText);
}

async function person(id) {
  await page.click(`[data-testid="person-${id}"]`);
  await page.waitForSelector(`[data-testid="person-${id}"]`);
}

await page.setViewport({ width: 1440, height: 1100 });
await page.goto(base, { waitUntil: "networkidle0" });
await page.waitForSelector('[data-testid="recommendation-rt-lectura"]');
let body = await text();
if (!body.includes("no crea una postulación")) {
  throw new Error("La recomendación no explica que no inscribe.\n" + body.slice(0, 500));
}
if (body.includes("Tus postulaciones")) {
  throw new Error("Camila ya tenía una postulación.");
}
await page.screenshot({ path: "/tmp/impulso-recomendacion.png", fullPage: false });

await page.click('[data-testid="apply-rt-lectura"]');
await page.waitForFunction(() => document.body.innerText.includes("Sigue pendiente"));
body = await text();
if (body.includes("confirmada") && body.includes("Tu cupo quedó confirmado")) {
  throw new Error("La postulación se confirmó sola.");
}

await person("vol-luis");
await page.goto(`${base}/retos/rt-lectura`, { waitUntil: "networkidle0" });
await page.waitForSelector('[data-testid="warning-rt-lectura"]');
body = await text();
if (!body.includes("no cubre")) throw new Error("No apareció el aviso de horario.");
await page.screenshot({ path: "/tmp/impulso-horario.png", fullPage: false });
await page.click('[data-testid="apply-rt-lectura"]');
await page.waitForFunction(() => document.body.innerText.includes("pendiente"));

await person("org-mariana");
await page.waitForSelector('[data-testid^="confirm-"]');
const before = await page.$$eval('[data-testid^="confirm-"]', (nodes) => nodes.length);
if (before < 2) throw new Error(`Se esperaban dos confirmaciones, hay ${before}.`);
await page.click('[data-testid^="confirm-"]');
await page.waitForFunction(() => document.body.innerText.includes("Confirmaste a Camila"));
await page.click('[data-testid^="confirm-"]');
await page.waitForFunction(() => document.body.innerText.includes("No quedan cupos"));
await page.screenshot({ path: "/tmp/impulso-cupos.png", fullPage: false });

await page.click('[data-testid="start-rt-lectura"]');
await page.waitForFunction(() => document.body.innerText.includes("en curso"));

await person("vol-camila");
await page.waitForSelector('[data-testid="evidence-rt-lectura"]');
await page.type('[data-testid="evidence-rt-lectura"]', "Leímos un cuento con ocho niños del barrio.");
await page.evaluate(() => {
  const button = [...document.querySelectorAll("button")].find((item) =>
    item.textContent?.includes("Entregar evidencia"),
  );
  button?.click();
});
await page.waitForFunction(() => document.body.innerText.includes("El reto no se cerró"));

await person("org-mariana");
await page.click('[data-testid="request-rt-lectura"]');
await page.waitForFunction(() => document.body.innerText.includes("pasó a cierre"));

await person("vol-luis");
await page.waitForSelector('[data-testid="validate-rt-lectura"]');
await page.click('[data-testid="validate-rt-lectura"]');
await page.waitForFunction(() =>
  document.body.innerText.includes("Solo el organizador del reto puede validar el cierre"),
);

await person("org-mariana");
await page.click('[data-testid="validate-rt-lectura"]');
await page.waitForFunction(() => document.body.innerText.includes("Cierre validado"));
await page.screenshot({ path: "/tmp/impulso-cierre.png", fullPage: false });

await person("org-hector");
await page.goto(`${base}/retos/rt-mapa`, { waitUntil: "networkidle0" });
await page.click('[data-testid="cancel-rt-mapa"]');
await page.waitForSelector('[data-testid="alternatives"]');
body = await text();
if (!body.includes("No se creó postulación")) {
  throw new Error("La cancelación no mostró alternativas sin inscripción.");
}
if (body.includes("Cartel de la minga del sábado. Se creó")) {
  throw new Error("La alternativa quedó inscrita.");
}

await person("vol-ana");
await page.goto(base, { waitUntil: "networkidle0" });
await page.waitForSelector('[data-testid="notice-vol-ana"]');
body = await text();
if (!body.includes("no te inscriben")) {
  throw new Error("Ana no vio la aclaración de no inscripción.");
}
const muralApps = await page.evaluate(() => document.body.innerText.includes("Cartel de la minga del sábado · pendiente"));
if (muralApps) throw new Error("Ana quedó postulada al cartel.");
await page.screenshot({ path: "/tmp/impulso-alternativas.png", fullPage: false });

await mkdir("public/capturas", { recursive: true });
await page.setViewport({ width: 1880, height: 1280 });
for (const momento of [1, 2, 3]) {
  await page.goto(`${base}/tablero?momento=${momento}&captura=1`, { waitUntil: "networkidle0" });
  await page.waitForSelector("[data-momento]");
  await page.screenshot({
    path: `public/capturas/momento-${momento}.png`,
    fullPage: true,
  });
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("recorrido ok");
}
await browser.close();
