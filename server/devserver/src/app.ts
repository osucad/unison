import express, { Express } from "express";
import { Provider } from 'nconf'

export function create(
    config: Provider
): Express {
  const app = express()

  app.get('/', (req, res) => {
    res.status(200).send('Unison devserver. Find out more at https://github.com/osucad/unison/tree/main/server/devserver')
  })

  return app
}