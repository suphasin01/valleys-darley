import { startSocial } from '../../../lib/social-auth';
export const GET = (request: Request) => startSocial(request, 'facebook');
