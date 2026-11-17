// pm2: els backends que corren al servidor DAW. Es copia a ~/apps/ en cada desplegament.
// Ports: cada alumne fa servir el seu rang (el 3000 ja l'ocupa algú altre).
const apps = process.env.HOME + '/apps'

module.exports = {
  apps: [
    {
      name: 'banderas',
      cwd: apps + '/juegodBanderas/backend',
      script: 'app.js',
      args: '20600',
      node_args: '--env-file=.env', // credencials MySQL, només al servidor
      max_memory_restart: '150M',
    },
    {
      name: 'time-attack-api',
      cwd: apps + '/backend_TIME_ATTACK',
      script: 'src/server.js',
      env: { PORT: 20601 },
      max_memory_restart: '150M',
    },
  ],
}
