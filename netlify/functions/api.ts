import serverless from 'serverless-http';
import { connectLambda } from '@netlify/blobs';
import { app } from '../../server/src/app';
import { useBlobsStorage } from '../../server/src/storage/kv';

useBlobsStorage();
const handle = serverless(app);

// Lambda-compatibility handler: Blobs needs the per-request context from the event.
export const handler = async (event: any, context: any) => {
  connectLambda(event);
  return handle(event, context);
};
