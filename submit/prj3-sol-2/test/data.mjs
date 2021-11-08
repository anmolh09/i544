function multipleUsers(n) {
  const genUser = i => ({
    id: `user-${i}`,
    firstName: `User${i}`,
    lastName: `TestUser`,
    address1: '${i} Main Street',
    city: 'Test City',
    state: 'Test State',
    zip: '12345',
    email: `user-${i}@test.com`,
  });
	
  const users = Array.from({length: n}).map((_, i) => genUser(i));
  return Object.fromEntries(users.map(u => [u.id, u]));
}

export default {
  BART: {
    id: "bart",
    firstName: "Bart",
    lastName: "Simpson",
    address1: '123 Main Street',
    city: 'Big City',
    state: 'Some State',
    zip: '12345',
    email: 'bart@springfield-schools.edu',
  },
  MARGE: {
    id: "marge",
    firstName: "Marge",
    lastName: "Simpson",
    address1: '123 Main Street',
    city: 'Big City',
    state: 'Some State',
    zip: '12345',
    email: 'marge-simpson@gmail.com',
  },
  LISA: {
    id: "lisa",
    firstName: "Lisa",
    lastName: "Simpson",
    birthDate: "1982-05-09",
    email: "smartgirl63_\\@yahoo.com",
    address1: '123 Main Street',
    city: 'Big City',
    state: 'Some State',
    zip: '12345',
  },
  HOMER: {
    id: "homer",
    firstName: "Homer",
    lastName: "Simpson",
    email: "chunkylover53@aol.com",
    address1: '123 Main Street',
    city: 'Big City',
    state: 'Some State',
    zip: '12345',
  },
  ...multipleUsers(20),
};
