import { Client } from 'discord.js-selfbot-v13';
import { WebhookClient, EmbedBuilder } from 'discord.js';
import moment from 'moment';
import readline from 'readline';
import axios from 'axios';
import 'colors';
import fs from 'fs/promises';
import { config } from '../config.js'

const client = new Client({ checkUpdate: false });

const webhook = new WebhookClient({ url: config.webhook });

client.on('ready', async () => {
  console.log('[SELF BOT]'.bgCyan + ` Connected in ${client.user.tag}`.cyan);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('[SERVER]'.bgYellow + ' Enter the Server ID: '.yellow, async (guildId) => {
    await FetchUsers(guildId);
    await BadgeScrapper(guildId);
    rl.close();
  });
});

async function FetchUsers(guildId) {
  try {
    const guild = await client.guilds.fetch(guildId);
    await guild.members.fetch();
    const memberIds = guild.members.cache.filter((member) => !member.user.bot).map((member) => member.id);
    await fs.mkdir('./files', { recursive: true });
    await fs.writeFile(`./files/${guildId}.txt`, memberIds.join('\n'));
    console.log(`[+] Saved ${memberIds.length} member IDs to ${guildId}.txt`.green);
  } catch (error) {
    console.error(error);
  }
}

async function BadgeScrapper(guildId) {
  try {
    const guild = await client.guilds.fetch(guildId);
    let invite;
    try {
      const inviteChannel = guild.channels.cache.find(channel => channel.type === 'GUILD_TEXT' && channel.permissionsFor(guild.members.me).has('CREATE_INSTANT_INVITE'));
      if (inviteChannel) {
        const url = await inviteChannel.createInvite({ maxAge: 0, maxUses: 0 })
        invite = `[${guild.name}](${url})\n[\`${guild.id}\`]`
      } else {
        invite = '*No Invite*';
      }
    } catch (error) {
      if (guild.vanityURLCode) {
        const url = `https://discord.gg/${guild.vanityURLCode}`
        invite = `[${guild.name}](${url})\n[\`${guild.id}\`]`;
      } else {
        invite = '*No Invite*';
      }
    }
    const memberIdsString = await fs.readFile(`./files/${guildId}.txt`, 'utf8');
    const memberIds = memberIdsString.split('\n');

    for (let i = 0; i < memberIds.length; i++) {
      let memberId = memberIds[i];
      if (!memberId) continue;

      try {
        const response = await axios.get(`http://localhost:3000/user/${memberId}`, {
            headers: {
              'Content-Type': 'application/json',
            },
          })
          .then((res) => res.data);

        const emojiBadges = {
          HypeSquadOnlineHouse1: '<:bravery:1147277514016829552>',
          HypeSquadOnlineHouse2: '<:brilliance:1147277517846220800>',
          HypeSquadOnlineHouse3: '<:balance:1147277521327493222>',
          PremiumEarlySupporter: '<:pig:1147277421083631716>',
          VerifiedDeveloper: '<:dev:1147277418529312909>',
          ActiveDeveloper: '<:activedev:1147277422337720462>',
          Hypesquad: '<:events:1147277516353044490>',
          Nitro: '<:nitro:1147281039123824660>',
          Staff: '<:staff:1148743598460907592>',
          CertifiedModerator: '<:mod:1148741072843985047>',
          BugHunterLevel1: '<:bughunter1:1148743596741230663>',
          BugHunterLevel2: '<:bughunter2:1148743595017371761>',
          Partner: '<:partner:1148741233888469092>',
          BoostLevel1: '<:boost:1147277282948431872>',
          BoostLevel2: '<:boost2:1147277285079126177>',
          BoostLevel3: '<:boost3:1147277281702727810>',
          BoostLevel4: '<:boost4:1147277286496796783>',
          BoostLevel5: '<:boost5:1147277277088989316>',
          BoostLevel6: '<:boost6:1147277290137452574>',
          BoostLevel7: '<:boost7:1147277293761335417>',
          BoostLevel8: '<:boost8:1147277288640090112>',
          BoostLevel9: '<:boost9:1147277292448534688>'
        };

        const scrapBadgeEmojis = {
          BoostLevel3: '<:boost3:1147277281702727810>',
          BoostLevel4: '<:boost4:1147277286496796783>',
          BoostLevel5: '<:boost5:1147277277088989316>',
          BoostLevel6: '<:boost6:1147277290137452574>',
          BoostLevel7: '<:boost7:1147277293761335417>',
          BoostLevel8: '<:boost8:1147277288640090112>',
          BoostLevel9: '<:boost9:1147277292448534688>',
          PremiumEarlySupporter: '<:pig:1147277421083631716>',
          BugHunterLevel1: '<:bughunter1:1148743596741230663>',
          BugHunterLevel2: '<:bughunter2:1148743595017371761>',
          Hypesquad: '<:events:1147277516353044490>',
          VerifiedDeveloper: '<:dev:1147277418529312909>',
          Partner: '<:partner:1148741233888469092>',
          CertifiedModerator: '<:mod:1148741072843985047>'
        };

        if (response.profile && response.profile.badgesArray) {
          const emojiBadgesArray = response.profile.badgesArray
            .filter((badge) => scrapBadgeEmojis[badge])
            .map((badge) => scrapBadgeEmojis[badge])
            .join('');

          if (emojiBadgesArray.length > 0) {
            const allEmojisArray = response.profile.badgesArray.map((badge) => emojiBadges[badge]).join('');
            console.log(`[+] ${response.user.tag || response.user.username} [${response.user.username}] | ${response.profile.badgesArray.join(', ')}`.green);

            const embed = new EmbedBuilder()
              .setAuthor({
                name: `${response.user.globalName || response.user.username} (@${response.user.username})`,
                iconURL: `${response.profile.avatarUrl}`,
              })
              .setThumbnail(response.profile.avatarUrl)
              .setTimestamp()
              .addFields(
                {
                  name: 'Badges:',
                  value: allEmojisArray,
                  inline: true,
                },
                {
                  name: 'Creation:',
                  value: `<t:${moment(response.user.createdAt).unix()}:R>`,
                  inline: true,
                },
                {
                  name: 'From Server:',
                  value: `${invite}`,
                  inline: false,
                }
              );

            if (response.boost) {
              const currentBoostLevel = response.boost.boost;
              const nextBoostLevel = response.boost.nextBoost;

              const currentBoostEmoji = emojiBadges[currentBoostLevel] || currentBoostLevel;
              const nextBoostEmoji = emojiBadges[nextBoostLevel] || nextBoostLevel;

              embed.addFields({
                name: `Boosting:`,
                value: `${currentBoostEmoji} <t:${moment(response.boost.boostDate).unix()}:R>`,
                inline: true,
              });

              if (response.boost.boost !== 'BoostLevel9') {
                embed.addFields({
                  name: `Next Up:`,
                  value: `${nextBoostEmoji} <t:${moment(response.boost.nextBoostDate).unix()}:R>`,
                  inline: true,
                });
              }
            }

            await webhook.send({ embeds: [embed], avatarURL: 'https://imgb.ifunny.co/images/ef4564ca5da18e0be2b96a712b9ee3bc1cb4f043e27ef230d0a7de355a1796fb_1.jpg' })
          }
        }
      } catch (err) {
        console.error(err);
      }
      if ((i + 1) % 360 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 15000));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log('[COMPLETE]'.bgGreen + ' Badge scraping process has completed.'.green);
  } catch (error) {
    console.error(error);
  }
}

client.login(config.user_token || config.alt_token);