db.auth('admin', '12345')

db = db.getSiblingDB('admin')

db.createUser({
  user: 'projector',
  pwd: 'projector',
  roles: [
    {
      role: 'readWrite',
      db: 'projections',
    },
  ],
});