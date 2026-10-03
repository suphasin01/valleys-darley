import { completeSocial } from '../../../../lib/social-auth';
export const GET = (request: Request) => completeSocial(request, 'google');
