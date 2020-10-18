import { Request, Response } from 'express';
import { URLSearchParams } from 'url';
import fetch from 'node-fetch';
import { decode } from 'jsonwebtoken';

interface Token {
  resource_access: {
    mqtt: {
      roles: string[];
    };
  };
}
export class AuthService {
  private tokenCache: Record<string, Token> = {};

  constructor(private tokenEndpoint: string) {}

  async userHandler(req: Request, res: Response) {
    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: req.body.username,
        client_secret: req.body.password,
      }),
    });
    if (!response.ok) {
      res.sendStatus(400);
      return;
    }
    const body = await response.json();
    const token = decode(body.access_token) as Token;
    this.tokenCache[req.body.username] = token;

    res.sendStatus(200);
    return;
  }

  superuserHandler(req: Request, res: Response) {
    res.sendStatus(
      this.hasPermission(req.body.username, 'superuser', 4) ? 200 : 403,
    );
  }

  aclhandler(req: Request, res: Response) {
    res.sendStatus(
      this.hasPermission(req.body.username, req.body.topic, req.body.acc)
        ? 200
        : 403,
    );
  }

  private escapeRegex(rgx: string) {
    return rgx.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&');
  }
  private wildcardMatch(wildcardStr: string, item: string) {
    return new RegExp(
      '^' + this.escapeRegex(wildcardStr).replace(/\*/g, '.*') + '$',
    ).test(item);
  }

  private hasPermission(username: string, topic: string, acl: 1 | 2 | 4) {
    const aclSuffix = { 1: 'r', 2: 'rw', 4: 'r' };
    const token = this.tokenCache[username];
    if (token) {
      const roles = token.resource_access?.mqtt?.roles || [];
      if (roles.includes('superuser')) {
        console.log(
          `Allowing user ${username} ${aclSuffix[acl]} superuser access to topic ${topic}`,
        );
        return true;
      }
      const allowedRoles = [
        '$SYS/*:rw',
        `infra/${username}/*:rw`,
        'public/*:rw',
        'info:r',
      ].concat(roles);
      for (let role of allowedRoles) {
        const parts = role.split(':');
        if (
          this.wildcardMatch(parts[0], topic) &&
          parts[1].includes(aclSuffix[acl])
        ) {
          console.log(
            `Allowing user ${username} ${aclSuffix[acl]} access to topic ${topic} after matching rule ${role}`,
          );
          return true;
        }
      }
    }
    return false;
  }
}
