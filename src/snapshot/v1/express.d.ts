/**
 * This code was generated by a tool.
 * @basketry/express@{{version}}
 *
 * Changes to this file may cause incorrect behavior and will be lost if
 * the code is regenerated.
 */

import { AuthService } from './auth';

declare global {
  namespace Express {
    interface Request {
      basketry?: { context: AuthService };
    }
  }
}