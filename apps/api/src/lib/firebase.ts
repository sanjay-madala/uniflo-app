import { initializeApp, cert, getApps, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function getServiceAccount(): ServiceAccount {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
    || '/root/.openclaw/credentials/firebase-sa.json';

  const raw = readFileSync(resolve(credPath), 'utf-8');
  const parsed = JSON.parse(raw) as {
    project_id: string;
    client_email: string;
    private_key: string;
  };

  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key,
  };
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert(getServiceAccount()),
  });
}

export const auth = getAuth();
