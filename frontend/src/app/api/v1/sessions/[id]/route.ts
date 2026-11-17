import { GET as getHandler, DELETE as deleteHandler } from '../../../sessions/[id]/route';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export const GET = getHandler;
export const DELETE = deleteHandler;

