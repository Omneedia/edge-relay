import {
  Application,
  Request,
  Status,
  Context,
} from 'https://deno.land/x/oak@v10.3.0/mod.ts';
import * as jose from 'https://deno.land/x/jose@v4.3.7/index.ts';
import { config } from 'https://deno.land/x/dotenv@v3.2.0/mod.ts';

async function writeJson(filePath: string, o: any) {
  await Deno.writeTextFile(filePath, JSON.stringify(o));
}
async function getJson(filePath: string) {
  return JSON.parse(await Deno.readTextFile(filePath));
}

await writeJson('./data.json', {
  a: 1,
  b: 2,
  c: { d: 'e', f: 'g', i: [1, 2, 3, 4] },
});

const d = await getJson('./data.json');
console.log(d);

const app = new Application();

const X_FORWARDED_HOST = 'x-forwarded-host';

const JWT_SECRET =
  Deno.env.get('JWT_SECRET') ?? config({ safe: true }).JWT_SECRET;
const DENO_ORIGIN =
  Deno.env.get('DENO_ORIGIN') ?? config({ safe: true }).DENO_ORIGIN;
const VERIFY_JWT =
  (Deno.env.get('VERIFY_JWT') ?? config({ safe: true }).VERIFY_JWT) === 'true';

app.use(async (ctx: Context, next: () => Promise<unknown>) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
    ctx.response.body = err.message;
    ctx.response.headers.append('x-relay-error', 'true');
    ctx.response.status = err.status || 500;
  }
});

app.use(async (ctx: Context, next: () => Promise<unknown>) => {
  const { request, response } = ctx;
  console.log(request);
  console.log(response);
  var url = String(request.url);
  /*  response.body =
    url.split('://')[1].split('.functions.omneedia.net')[0] +
    '-' +
    url.substring(url.lastIndexOf('/') + 1, url.length);*/
  const resp = await fetch('https://app.fakejson.com/q', {
    headers: {
      accept: 'application/json',
    },
    method: 'POST',
    body: {
      token: '7p5UI7BXyvQPstfkWv1G3g',
      data: JSON.stringify({
        name: 'nameFirst',
        email: 'internetEmail',
        phone: 'phoneHome',
        _repeat: 300,
      }),
    },
  });
  /*return new Response(resp.body, {
    status: resp.status,
    headers: {
      'content-type': 'application/json',
    },
  });*/
  console.log(resp);
  response.body = resp.body;
  await next();
});

if (import.meta.main) {
  const port = parseInt(Deno.args?.[0] ?? 8081);
  const hostname = '0.0.0.0';

  console.log(`Listening on http://${hostname}:${port}`);
  await app.listen({ port, hostname });
}
