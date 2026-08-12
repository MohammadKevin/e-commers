const http = require('http');

const SECRET_KEY = 'secret-admin-key-2026';
const API_URL = 'http://localhost:5000';

const usersToCreate = [
  {
    email: 'admin@saksershop.com',
    fullName: 'Super Admin',
    password: 'password123',
    globalRole: 'SUPER_ADMIN'
  },
  {
    email: 'finance@saksershop.com',
    fullName: 'Finance Admin',
    password: 'password123',
    globalRole: 'FINANCE_ADMIN'
  },
  {
    email: 'marketing@saksershop.com',
    fullName: 'Marketing Admin',
    password: 'password123',
    globalRole: 'MARKETING_ADMIN'
  },
  {
    email: 'cs@saksershop.com',
    fullName: 'Operations CS',
    password: 'password123',
    globalRole: 'OPERATIONS_CS'
  }
];

const regularUser = {
  email: 'seller@saksershop.com',
  fullName: 'Toko Sejahtera',
  password: 'password123'
};

async function createAdmin(user) {
  const data = JSON.stringify({ ...user, secretKey: SECRET_KEY });
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/auth/register-admin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        console.log(`[Admin] Created ${user.email}: ${res.statusCode}`);
        resolve();
      });
    });
    req.on('error', e => console.error(e));
    req.write(data);
    req.end();
  });
}

async function createUser(user) {
  const data = JSON.stringify(user);
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        console.log(`[User] Created ${user.email}: ${res.statusCode}`);
        resolve();
      });
    });
    req.on('error', e => console.error(e));
    req.write(data);
    req.end();
  });
}

async function run() {
  for (const user of usersToCreate) {
    await createAdmin(user);
  }
  await createUser(regularUser);
  console.log('All test accounts created!');
}

run();
