import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import 'colors';

const __filename = fileURLToPath(import.meta.url).toString();
const __dirname = dirname(__filename);

export default async function apiRegisterRoutes(app) {
  const routesArr = readdirSync(__dirname + '/routes');
  console.clear();
  console.log( `[API]`.bgMagenta, `${routesArr.length} Loaded Route(s)`.magenta );

  for (const route of routesArr) {
    const {
      default: { method, name, execute },
    } = await import(`file:${__dirname}/routes/${route}/endpoint.js`);
    app[method](name, (req, res) => execute(req, res));
  }

  app.use(async (req, res) => {
    return res.status(404).json({
      API: 'Unknown route: 404'
    });
  });
}