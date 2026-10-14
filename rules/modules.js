const PUBLIC_ENV = '/^(NEXT_PUBLIC_|NODE_ENV$)/';
const ENV = "MemberExpression[object.object.name='process'][object.property.name='env']";
const PRIVATE_ENV = `${ENV}[property.name!=${PUBLIC_ENV}]`;
const SECRET_ENV = `${PRIVATE_ENV}[property.name=/(SECRET|TOKEN|KEY|PASSWORD|PRIVATE|CREDENTIAL|DATABASE|DB_)/]`;
const SERVER_MODULE = '/^(server-only|fs|fs.promises|path|os|child_process)$|^node:|^next.headers$/';
const CLIENT_FILE = "Program[body.0.directive='use client']";

export const reExportBan = {
  id: 're-export',
  selector: 'ExportAllDeclaration, ExportNamedDeclaration[source]',
  message:
    'Import from the file that defines it, not through a re-export (barrel). Barrels slow builds, break tree-shaking and cause circular imports.',
};

export const clientBoundaryBans = [
  {
    id: 'client-boundary',
    selector: `${CLIENT_FILE} ImportDeclaration[source.value=${SERVER_MODULE}]`,
    message: "A 'use client' file runs in the browser. It cannot import server code; pass the data in as props or call a server action.",
  },
  {
    id: 'client-boundary',
    selector: `${CLIENT_FILE} ${PRIVATE_ENV}`,
    message: "A 'use client' file can only read NEXT_PUBLIC_ env vars. Other env vars are undefined in the browser.",
  },
];

export const secretEnvBan = {
  id: 'server-only',
  selector: `Program:not(:has(ImportDeclaration[source.value='server-only'])):not([body.0.directive=/^use (client|server)$/]) ${SECRET_ENV}`,
  message:
    "This file reads a secret env var. Add import 'server-only' at the top, so importing it into a client component fails the build instead of shipping server code to the browser.",
};
