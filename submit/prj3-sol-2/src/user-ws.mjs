import Path from 'path';

import { DEFAULT_LIMIT } from './consts.mjs';

import cors from 'cors';
import express from 'express';
//HTTP status codes
import STATUS from 'http-status';  
import assert from 'assert';
import bodyParser from 'body-parser';
import querystring from 'querystring';

export default function serve(model, base='') {
  const app = express();
  cdThisDir();
  app.locals.model = model;
  app.locals.base = base;
  app.use(express.static('statics'));
  setupRoutes(app);
  return app;
}


function cdThisDir() {
  try {
    const path = new URL(import.meta.url).pathname;
    const dir = Path.dirname(path);
    process.chdir(dir);
  }
  catch (err) {
    console.error(`cannot cd to this dir: ${err}`);
    process.exit(1);
  }
}

function setupRoutes(app) {
  const base = app.locals.base;
  app.use(cors());
  app.use(bodyParser.json());
  //app.use((req, res, next) => { console.error(base, req.originalUrl); next(); });
  app.get(base, doSearch(app));
  app.post(base, doCreate(app));
  app.get(`${base}/:id`, doGet(app));
  app.delete(`${base}/:id`, doDelete(app));
  app.put(`${base}/:id`, doReplace(app));
  app.patch(`${base}/:id`, doUpdate(app));

  //must be last
  app.use(do404(app));
  app.use(doErrors(app));
}


function doCreate(app) {
  return (async function(req, res) {
    try {
      const obj = req.body;
      const result = await app.locals.model.create(obj);
      if (result.errors) throw result;
      const location = requestUrl(req) + '/' + obj.id;
      res.append('Location', location);
      res.sendStatus(STATUS.CREATED);
    }
    catch(err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  });
}


function doGet(app) {
  return (async function(req, res) {
    try {
      const id = req.params.id;
      const result = await app.locals.model.read({ id: id });
      if (result.errors) throw result;
      res.json(addSelfLinks(req, result));
    }
    catch(err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  });
}

function doDelete(app) {
  return (async function(req, res) {
    try {
      const id = req.params.id;
      const result = await app.locals.model.delete({ id: id });
      if (result.errors) throw result;
      res.sendStatus(STATUS.NO_CONTENT);
    }
    catch(err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  });
}

function doReplace(app) {
  return (async function(req, res) {
    try {
      const replacement = Object.assign({}, req.body);
      replacement.id = req.params.id;
      const result = await app.locals.model.replace(replacement);
      if (result.errors) throw result;
      res.sendStatus(STATUS.NO_CONTENT);
    }
    catch(err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  });
}


function doUpdate(app) {
  return (async function(req, res) {
    try {
      const patch = Object.assign({}, req.body);
      patch.id = req.params.id;
      const result = await app.locals.model.update(patch);
      if (result.errors) throw result;
      res.sendStatus(STATUS.NO_CONTENT);
    }
    catch(err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  });
}

function doSearch(app) {
  return (async function(req, res) {
    try {
      const q = Object.assign({}, req.query || {});
      const offset = getNonNegInt(q, '_offset', 0);
      if (offset.errors) throw offset;
      const limit = getNonNegInt(q, '_limit', DEFAULT_LIMIT);
      if (limit.errors) throw limit;
      const options = { _offset : offset, _limit: limit + 1 };
      const result = await app.locals.model.search({...q, ...options});
      if (result.errors) throw result;
      res.json(addPagingLinks(req, result));
    }
    catch (err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  });
}

function getNonNegInt(query, key, defaultVal) {
  const n = query[key];
  if (n === undefined) {
    return defaultVal;
  }
  else if (!/^\d+$/.test(n)) {
    const message = `${key} "${n}" must be a non-negative integer`;
    return {errors: [{ message, options: { code: 'BAD_VAL', widget: key}}]};
  }
  else {
    delete query[key];
    return Number(n);
  }
}

/** Default handler for when there is no route for a particular method
 *  and path.
 */
function do404(app) {
  return async function(req, res) {
    const message = `${req.method} not supported for ${req.originalUrl}`;
    const result = {
      status: STATUS.NOT_FOUND,
      errors: [	{ code: 'NOT_FOUND', message, }, ],
    };
    res.status(STATUS.NOT_FOUND).json(result);
  };
}


/** Ensures a server error results in nice JSON sent back to client
 *  with details logged on console.
 */ 
function doErrors(app) {
  return async function(err, req, res, next) {
    const result = {
      status: STATUS.INTERNAL_SERVER_ERROR,
      errors: [ { code: 'SERVER_ERROR', message: err.message } ],
    };
    res.status(SERVER_ERROR).json(result);
    console.error(result.errors);
  };
}

/************************* HATEOAS Utilities ***************************/

/** Return original URL for req (excluding query params)
 *  Ensures that url does not end with a /
 */
function requestUrl(req) {
  const url = req.originalUrl.replace(/\/?(\?.*)?$/, '');
  return `${req.protocol}://${req.get('host')}${url}`;
}

function queryUrl(req, query={}) {
  const url = new URL(requestUrl(req));
  Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.href;
}

function addSelfLinks(req, obj, doId = false) {
  const baseUrl = requestUrl(req);
  const href = (doId) ? `${baseUrl}/${obj.id}` : baseUrl;
  const links = [ { rel: 'self', name: 'self', href } ];
  return {result: obj,  links: links };
}

function addPagingLinks(req, results) {
  const links = [
    { rel: 'self', name: 'self', href: queryUrl(req, req.query) }
  ];
  const limit = Number(req.query?._limit ?? DEFAULT_LIMIT);
  const nResults = results.length;  //may be 1 more than limit
  const next = pagingUrl(req, nResults, +1);
  if (next) links.push({ rel: 'next', name: 'next', href: next });
  const prev = pagingUrl(req, nResults, -1);
  if (prev) links.push({ rel: 'prev', name: 'prev', href: prev });
  const results1 =
    results.slice(0, limit).map(obj => addSelfLinks(req, obj, true));
  return { result: results1, links: links };
}

//offset and limit have been validated  
function pagingUrl(req, nResults, dir) {
  const q = req.query;
  const offset = Number(q?._offset ?? 0);
  const limit = Number(q?._limit ?? DEFAULT_LIMIT);
  const offset1 = (offset + dir*limit) < 0 ? 0 : (offset + dir*limit);
  const query1 = Object.assign({}, q, { _offset: offset1 });
  return ((dir > 0 && nResults <= limit) || (dir < 0 && offset1 === offset))
         ? null
         : queryUrl(req, query1);
}

/*************************** Mapping Errors ****************************/

//map from domain errors to HTTP status codes.  If not mentioned in
//this map, an unknown error will have HTTP status BAD_REQUEST.
const ERROR_MAP = {
  EXISTS: STATUS.CONFLICT,
  NOT_FOUND: STATUS.NOT_FOUND,
  DB: STATUS.INTERNAL_SERVER_ERROR,
  INTERNAL: STATUS.INTERNAL_SERVER_ERROR,
}

/** Return first status corresponding to first option.code in
 *  appErrors, but SERVER_ERROR dominates other statuses.  Returns
 *  BAD_REQUEST if no code found.
 */
function getHttpStatus(appErrors) {
  let status = null;
  for (const appError of appErrors) {
    const errStatus = ERROR_MAP[appError.options?.code];
    if (!status) status = errStatus;
    if (errStatus === STATUS.INTERNAL_SERVER_ERROR) status = errStatus;
  }
  return status ?? STATUS.BAD_REQUEST;
}

/** Map domain/internal errors into suitable HTTP errors.  Return'd
 *  object will have a "status" property corresponding to HTTP status
 *  code.
 */
function mapResultErrors(err) {
  const errors = err.errors ||
    [ { message: err.message, options: { code: 'INTERNAL' } } ];
  const status = getHttpStatus(errors);
  if (status === STATUS.INTERNAL_SERVER_ERROR) {
    console.error(err.val.toString());
  }
  return { status, errors, };
} 

