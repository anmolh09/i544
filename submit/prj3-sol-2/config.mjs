const CERT_BASE = `${process.env.HOME}/tmp/localhost-certs`;

export default {

  db: {
    url:  'mongodb://localhost:27017/users',
  },

  ws: {
    port: 1234,
    base: '/users',
  },

  https: {
    certPath: `${CERT_BASE}/localhost.crt`,
    keyPath: `${CERT_BASE}/localhost.key`,
  },
  

};
