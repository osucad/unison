import nconf from 'nconf'
import { create as createApp } from './app'

nconf.argv()
    .env()
    .defaults({
      port: 3000,
      storage: '.storage'
    })

const app = createApp(nconf)

app.listen(nconf.get('port'), () => {
  console.log(`Listening on port ${nconf.get('port')}`)
})
