import { URLSearchParams } from 'url';
import fetch from 'node-fetch';
import { decode } from 'jsonwebtoken';

export class AuthService {
  private tokenCache = {};

  constructor(private tokenEndpoint: string) {}

  async userHandler(req, res) {
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
    const token = decode(body.access_token);
    this.tokenCache[req.body.username] = token;

    res.sendStatus(200);
    return;
  }

  superuserHandler(req, res) {
    res.sendStatus(
      hasPermission(this.tokenCache, req.body.username, 'superuser', 4)
        ? 200
        : 403,
    );
  }

  aclhandler(req, res) {
    res.sendStatus(
      hasPermission(
        this.tokenCache,
        req.body.username,
        req.body.topic,
        req.body.acc,
      )
        ? 200
        : 403,
    );
  }
}

function escapeRegex(string) {
  return string.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&');
}
function wildcardMatch(wildcardStr, item) {
  return new RegExp(
    '^' + escapeRegex(wildcardStr).replace(/\*/g, '.*') + '$',
  ).test(item);
}

function hasPermission(tokenCache, username, topic, acl) {
  const aclSuffix = { 1: 'r', 2: 'rw', 4: 'r' };
  const token = tokenCache[username];
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
      if (wildcardMatch(parts[0], topic) && parts[1].includes(aclSuffix[acl])) {
        console.log(
          `Allowing user ${username} ${aclSuffix[acl]} access to topic ${topic} after matching rule ${role}`,
        );
        return true;
      }
    }
  }
  return false;
}
