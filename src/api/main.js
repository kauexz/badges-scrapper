import apiRegisterRoutes from './handler.js';
import Express from 'express';
import cors from 'cors';
import requestIp from 'request-ip';
import 'colors';
import { config } from '../../config.js'

import { Client, GatewayIntentBits, Partials } from 'discord.js';
const client = new Client({
  intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds],
  partials: [Partials.User, Partials.GuildMember],
});

const app = Express();

app.use(requestIp.mw());
app.use(
  cors({
    origin: '*',
    methods: ['GET'],
  })
);

apiRegisterRoutes(app);

app.listen(3000, () => {
  console.log('[API SERVER]'.bgGreen, 'Loaded in port 3000'.green);
  client.login(config.bot_token).then(() => {
    console.log('[DISCORD BOT]'.bgBlue, `Connected in ${client.user.tag}`.blue);
  });
});

export default client;
process.on('unhandledRejection', (reason, promise) => {
  console.log(reason, promise);
});
process.on('uncaughtException', (error, origin) => {
  console.log(error, origin);
});
process.on('uncaughtExceptionMonitor', (error, origin) => {
  console.log(error, origin);
});