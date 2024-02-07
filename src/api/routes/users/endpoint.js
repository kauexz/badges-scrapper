import axios from 'axios';
import client from '../../main.js';
import { ApplicationFlagsBitField } from 'discord.js';
import { config } from '../../../../config.js'

export default {
  name: '/user/:userId',
  method: 'get',

  async execute(req, res) {
    if (!req.params.userId) {
      return res.status(404).json({
        status: '404: You need to pass an Discord User ID to continue'
      });
    } else {
      const userID = await client.users
        .fetch(req.params.userId)
        .catch((e) => console.log(e));
      if (!userID) {
        return res.status(404).json({
          status: '404: Invalid User ID'
        });
      } else {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const request = await axios.get(
            `https://discord.com/api/v10/users/${req.params.userId}/profile`,
            {
              proxy: {
                protocol: 'http',
                host: 'p.webshare.io',
                port: 80,
                auth: {
                  username: 'lcmuzjvk-rotate',
                  password: '3shsgvxj0i5d'
                }
              },
              headers: {
                Authorization: config.user_token,
                'content-type': 'application/json',
              },
            }
          )

          if (request.statusCode) {
            if (request.statusCode === 50001) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              const request = await axios.get(
                `https://discord.com/api/v10/users/${req.params.userId}/profile`,
                {
                  proxy: {
                    protocol: 'http',
                    host: 'p.webshare.io',
                    port: 80,
                    auth: {
                      username: 'lcmuzjvk-rotate',
                      password: '3shsgvxj0i5d'
                    }
                  },
                  headers: {
                    Authorization: config.alt_token,
                    'Content-Type': 'application/json',
                  },
                }
              )

              const boostDiff = diffMonths(
                new Date(request.data.premium_guild_since),
                new Date()
              );
              const boostInfo = await getBoostInfo(
                `${request.data.user.username}#${request.data.user.discriminator}`,
                boostDiff,
                request.data.premium_guild_since,
                userID.flags.toArray(),
                request.data.premium_type,
                request.data.user.bio,
                request.data.premium_since,
                userID.id,
                userID.avatarURL({ size: 4096, extension: 'png' }),
                request.data.user_profile.banner,
                request.data.user.discriminator,
                request.data.user.username,
                request.data.connected_accounts,
                request.data.user.bot,
                request.data.application,
                request.data.badges,
                userID.createdAt,
                request.data.user.global_name,
                request.data.legacy_username
              );

              res.status(200).json(boostInfo);
              }
          } else {
            const boostDiff = diffMonths(
              new Date(request.data.premium_guild_since),
              new Date()
            );
            const boostInfo = await getBoostInfo(
              `${request.data.user.username}#${request.data.user.discriminator}`,
              boostDiff,
              request.data.premium_guild_since,
              userID.flags.toArray(),
              request.data.premium_type,
              request.data.user.bio,
              request.data.premium_since,
              userID.id,
              userID.avatarURL({ size: 4096, extension: 'png', extension: 'png' }),
              request.data.user_profile.banner,
              request.data.user.discriminator,
              request.data.user.username,
              request.data.connected_accounts,
              request.data.user.bot,
              request.data.application,
              request.data.badges,
              userID.createdAt,
              request.data.user.global_name,
              request.data.legacy_username
            );

            res.status(200).json(boostInfo);
          }
        } catch (e) {
          console.error(e)
          res.status(500).json({
            message: 'Erro desconhecido na API, tente novamente.',
            type: 'ERROR',
            status: 500,
          });
        }
      }
    }
  },
};
function diffMonths(startDate, finalDate, roundUpFractionalMonths) {
  var startDate = startDate;
  var endDate = finalDate;
  var inverse = false;
  if (startDate > finalDate) {
    startDate = finalDate;
    endDate = startDate;
    inverse = true;
  }

  var yearsDifference = endDate.getFullYear() - startDate.getFullYear();
  var monthsDifference = endDate.getMonth() - startDate.getMonth();
  var daysDifference = endDate.getDate() - startDate.getDate();

  var monthCorrection = 0;
  if (roundUpFractionalMonths === true && daysDifference > 0) {
    monthCorrection = 1;
  } else if (roundUpFractionalMonths !== true && daysDifference < 0) {
    monthCorrection = -1;
  }
  return (
    (inverse ? -1 : 1) *
    (yearsDifference * 12 + monthsDifference + monthCorrection)
  );
}

async function getBoostInfo(
  user,
  difference,
  data,
  array,
  type,
  bio,
  dataPremium,
  id,
  avatar,
  banner,
  discrim,
  username,
  connectedAcc,
  isBot,
  appInfo,
  appBadges,
  createdAt,
  globalName,
  legacyUsername
) {
  let bannerUrl;
  if (banner) {
    bannerUrl = `https://cdn.discordapp.com/banners/${id}/${banner}.${
      banner.startsWith('a_') ? 'gif?size=4096' : 'png?size=4096'
    }`;
  } else {
    bannerUrl = null;
  }

  var userBoost;
  var nextBoost;
  var nextBoostDate;
  var currentBoostDate = new Date(data);
  var badgesArray = array;
  var badgesOrder = [
    'Staff',
    'Partner',
    'CertifiedModerator',
    'Hypesquad',
    'HypeSquadOnlineHouse1',
    'HypeSquadOnlineHouse2',
    'HypeSquadOnlineHouse3',
    'BugHunterLevel1',
    'BugHunterLevel2',
    'ActiveDeveloper',
    'VerifiedDeveloper',
    'PremiumEarlySupporter'
  ];

  function compareBadges(a, b) {
    return badgesOrder.indexOf(a) - badgesOrder.indexOf(b);
  }

  badgesArray.sort(compareBadges);

  var premiumType;
  var aboutMe = bio || null;
  if (type === 1) premiumType = 'NitroClassic';
  if (type === 3) premiumType = 'NitroBasic';

  const connectedAccounts = connectedAcc.length ? connectedAcc : null;

  if (isBot) {
    if (appBadges.find((a) => a.id === 'bot_commands'))
      badgesArray.push('ApplicationCommandBadge');
    if (appBadges.find((a) => a.id === 'automod'))
      badgesArray.push('ApplicationAutoModerationRuleCreateBadge');

    const request = await axios.get(
      `https://discord.com/api/v9/applications/${appInfo.id}/rpc`,
      {
        headers: {
          'content-type': 'application/json',
        },
      }
    );

    const botIntents = new ApplicationFlagsBitField(request.flags);

    if (!appInfo.verified) {
      return {
        user: {
          id: id,
          username: username,
          tag: user,
          createdAt: new Date(createdAt),
        },
        profile: {
          badgesArray: badgesArray.filter((a) => isNaN(a)),
          aboutMe: aboutMe || null,
          avatarUrl:
            avatar ||
            `https://cdn.discordapp.com/embed/avatars/${
              Number(discrim) % 5
            }.png`,
        },
        application: {
          verified: appInfo.verified,
          customInstallUrl: request.custom_install_url || null,
          termsOfServiceUrl: request.terms_of_service_url || null,
          privacyPolicyUrl: request.privacy_policy_url || null,
          publicBot: request.bot_public || null,
          tags: request.tags || null,
          intents:
            botIntents
              .toArray()
              .filter(
                (a) =>
                  isNaN(a) &&
                  a !== 'ApplicationCommandBadge' &&
                  a !== 'ApplicationAutoModerationRuleCreateBadge'
              ) || null,
        },
      };
    } else {
      const req = await axios.get(
        `https://discord.com/api/v9/application-directory/applications/${appInfo.id}`,
        {
          headers: {
            Authorization: config.user_token,
            'content-type': 'application/json',
          },
        }
      );

      if (req.message) {
        if (req.statusCode === 20012) {
          return {
            user: {
              id: id,
              username: username,
              tag: user,
              createdAt: new Date(createdAt),
            },
            profile: {
              badgesArray: badgesArray.filter((a) => isNaN(a)),
              aboutMe: aboutMe || null,
              avatarUrl:
                avatar ||
                `https://cdn.discordapp.com/embed/avatars/${
                  Number(discrim) % 5
                }.png`,
            },
            application: {
              verified: appInfo.verified,
              customInstallUrl: request.custom_install_url || null,
              termsOfServiceUrl: request.terms_of_service_url || null,
              privacyPolicyUrl: request.privacy_policy_url || null,
              publicBot: request.bot_public || null,
              tags: request.tags || null,
              intents: !botIntents
                .toArray()
                .filter(
                  (a) =>
                    isNaN(a) &&
                    a !== 'ApplicationCommandBadge' &&
                    a !== 'ApplicationAutoModerationRuleCreateBadge'
                ).length
                ? null
                : botIntents
                    .toArray()
                    .filter(
                      (a) =>
                        isNaN(a) &&
                        a !== 'ApplicationCommandBadge' &&
                        a !== 'ApplicationAutoModerationRuleCreateBadge'
                    ),
            },
          };
        }
      } else {
        return {
          user: {
            id: id,
            username: username,
            tag: user,
            createdAt: new Date(createdAt),
          },
          profile: {
            badgesArray: badgesArray.filter((a) => isNaN(a)),
            aboutMe: aboutMe || null,
            avatarUrl:
              avatar ||
              `https://cdn.discordapp.com/embed/avatars/${
                Number(discrim) % 5
              }.png`,
          },
          application: {
            verified: appInfo.verified,
            customInstallUrl: request.custom_install_url || null,
            termsOfServiceUrl: request.terms_of_service_url || null,
            privacyPolicyUrl: request.privacy_policy_url || null,
            approximatedGuildCount: req.directory_entry.guild_count,
            publicBot: request.bot_public || null,
            tags: request.tags || null,
            intents: !botIntents
              .toArray()
              .filter(
                (a) =>
                  isNaN(a) &&
                  a !== 'ApplicationCommandBadge' &&
                  a !== 'ApplicationAutoModerationRuleCreateBadge'
              ).length
              ? null
              : botIntents
                  .toArray()
                  .filter(
                    (a) =>
                      isNaN(a) &&
                      a !== 'ApplicationCommandBadge' &&
                      a !== 'ApplicationAutoModerationRuleCreateBadge'
                  ),
          },
        };
      }
    }
  } else if (type === 2 && data) {
    premiumType = 'Nitro';
    var data = new Date(data);
    if (difference >= 0 && difference < 2 && data !== null)
      (userBoost = 'BoostLevel1'),
        (nextBoost = 'BoostLevel2'),
        (nextBoostDate = new Date(data.setMonth(data.getMonth() + 2)));
    if (difference >= 2 && difference < 3 && data !== null)
      (userBoost = 'BoostLevel2'),
        (nextBoost = 'BoostLevel3'),
        (nextBoostDate = new Date(data.setMonth(data.getMonth() + 3)));
    if (difference >= 3 && difference < 6 && data !== null)
      (userBoost = 'BoostLevel3'),
        (nextBoost = 'BoostLevel4'),
        (nextBoostDate = new Date(data.setMonth(data.getMonth() + 6)));
    if (difference >= 6 && difference < 9 && data !== null)
      (userBoost = 'BoostLevel4'),
        (nextBoost = 'BoostLevel5'),
        (nextBoostDate = new Date(data.setMonth(data.getMonth() + 9)));
    if (difference >= 9 && difference < 12 && data !== null)
      (userBoost = 'BoostLevel5'),
        (nextBoost = 'BoostLevel6'),
        (nextBoostDate = new Date(data.setMonth(data.getMonth() + 12)));
    if (difference >= 12 && difference < 15 && data !== null)
      (userBoost = 'BoostLevel6'),
        (nextBoost = 'BoostLevel7'),
        (nextBoostDate = new Date(data.setMonth(data.getMonth() + 15)));
    if (difference >= 15 && difference < 18 && data !== null)
      (userBoost = 'BoostLevel7'),
        (nextBoost = 'BoostLevel8'),
        (nextBoostDate = new Date(data.setMonth(data.getMonth() + 18)));
    if (difference >= 18 && difference < 24 && data !== null)
      (userBoost = 'BoostLevel8'),
        (nextBoost = 'BoostLevel9'),
        (nextBoostDate = new Date(data.setMonth(data.getMonth() + 24)));
    if (difference >= 24 && data !== null)
      (userBoost = 'BoostLevel9'),
        (nextBoost = 'MaxLevelReached'),
        (nextBoostDate = 'MaxLevelReached');

    array.push('Nitro', userBoost);
    return {
      user: {
        id: id,
        username: username,
        tag: discrim === '0' ? globalName : user,
        premiumType: premiumType,
        premiumSince: new Date(dataPremium),
        createdAt: new Date(createdAt),
        globalName: globalName || null,
        legacyUsername: legacyUsername || null,
      },
      profile: {
        badgesArray: badgesArray.filter((a) => isNaN(a)),
        aboutMe: aboutMe || null,
        avatarUrl:
          avatar ||
          `https://cdn.discordapp.com/embed/avatars/${Number(discrim) % 5}.png`,
        bannerUrl: bannerUrl || null,
      },
      boost: {
        boost: userBoost,
        boostDate: currentBoostDate,
        nextBoost: nextBoost,
        nextBoostDate: nextBoostDate,
      },
      connectedAccounts,
    };
  } else if (type === 1 || type === 3) {
    array.push('Nitro');
    return {
      user: {
        id: id,
        username: username,
        tag: discrim === '0' ? globalName : user,
        createdAt: new Date(createdAt),
        premiumType: premiumType,
        premiumSince: new Date(dataPremium),
        globalName: globalName || null,
        legacyUsername: legacyUsername || null,
      },
      profile: {
        badgesArray: badgesArray.filter((a) => isNaN(a)),
        aboutMe: aboutMe || null,
        avatarUrl:
          avatar ||
          `https://cdn.discordapp.com/embed/avatars/${Number(discrim) % 5}.png`,
        bannerUrl: bannerUrl || null,
      },
      connectedAccounts,
    };
  } else if (data) {
    var data = new Date(data);
    if (difference >= 0 && difference < 2 && data !== null)
      (userBoost = 'BoostLevel1'),
        (nextBoost = 'BoostLevel2'),
        (nextBoostDate = new Date(data.setMonth(data.getMonth() + 2)));
    if (difference >= 2 && difference < 3 && data !== null)
      (userBoost = 'BoostLevel2'),
        (nextBoost = 'BoostLevel3'),
        (nextBoostDate = new Date(data.setMonth(data.getMonth() + 3)));
    if (difference >= 3 && difference < 6 && data !== null)
      (userBoost = 'BoostLevel3'),
        (nextBoost = 'BoostLevel4'),
        (nextBoostDate = new Date(data.setMonth(data.getMonth() + 6)));
    if (difference >= 6 && difference < 9 && data !== null)
      (userBoost = 'BoostLevel4'),
        (nextBoost = 'BoostLevel5'),
        (nextBoostDate = new Date(data.setMonth(data.getMonth() + 9)));
    if (difference >= 9 && difference < 12 && data !== null)
      (userBoost = 'BoostLevel5'),
        (nextBoost = 'BoostLevel6'),
        (nextBoostDate = new Date(data.setMonth(data.getMonth() + 12)));
    if (difference >= 12 && difference < 15 && data !== null)
      (userBoost = 'BoostLevel6'),
        (nextBoost = 'BoostLevel7'),
        (nextBoostDate = new Date(data.setMonth(data.getMonth() + 15)));
    if (difference >= 15 && difference < 18 && data !== null)
      (userBoost = 'BoostLevel7'),
        (nextBoost = 'BoostLevel8'),
        (nextBoostDate = new Date(data.setMonth(data.getMonth() + 18)));
    if (difference >= 18 && difference < 24 && data !== null)
      (userBoost = 'BoostLevel8'),
        (nextBoost = 'BoostLevel9'),
        (nextBoostDate = new Date(data.setMonth(data.getMonth() + 24)));
    if (difference >= 24 && data !== null)
      (userBoost = 'BoostLevel9'),
        (nextBoost = 'MaxLevelReached'),
        (nextBoostDate = 'MaxLevelReached');

    array.push(userBoost);
    return {
      user: {
        id: id,
        username: username,
        tag: discrim === '0' ? globalName : user,
        createdAt: new Date(createdAt),
        globalName: globalName || null,
        legacyUsername: legacyUsername || null,
      },
      profile: {
        badgesArray: badgesArray.filter((a) => isNaN(a)),
        aboutMe: aboutMe || null,
        avatarUrl:
          avatar ||
          `https://cdn.discordapp.com/embed/avatars/${Number(discrim) % 5}.png`,
        bannerUrl: bannerUrl || null,
      },
      boost: {
        boost: userBoost,
        boostDate: currentBoostDate,
        nextBoost: nextBoost,
        nextBoostDate: nextBoostDate,
      },
      connectedAccounts,
    };
  } else if (type === 2 && !data) {
    premiumType = 'Nitro';
    array.push('Nitro');
    return {
      user: {
        id: id,
        username: username,
        tag: discrim === '0' ? globalName : user,
        createdAt: new Date(createdAt),
        premiumType: premiumType,
        premiumSince: new Date(dataPremium),
        globalName: globalName || null,
        legacyUsername: legacyUsername || null,
      },
      profile: {
        badgesArray: badgesArray.filter((a) => isNaN(a)),
        aboutMe: aboutMe || null,
        avatarUrl:
          avatar ||
          `https://cdn.discordapp.com/embed/avatars/${Number(discrim) % 5}.png`,
        bannerUrl: bannerUrl || null,
      },
      connectedAccounts,
    };
  } else if (array.length === 0) {
    return {
      user: {
        id: id,
        username: username,
        tag: discrim === '0' ? globalName : user,
        createdAt: new Date(createdAt),
        globalName: globalName || null,
        legacyUsername: legacyUsername || null,
      },
      profile: {
        badgesArray: null,
        aboutMe: aboutMe || null,
        avatarUrl:
          avatar ||
          `https://cdn.discordapp.com/embed/avatars/${Number(discrim) % 5}.png`,
        bannerUrl: bannerUrl || null,
      },
      connectedAccounts,
    };
  } else {
    return {
      user: {
        id: id,
        username: username,
        tag: discrim === '0' ? globalName : user,
        createdAt: new Date(createdAt),
        globalName: globalName || null,
        legacyUsername: legacyUsername || null,
      },
      profile: {
        badgesArray: badgesArray.filter((a) => isNaN(a)),
        aboutMe: aboutMe || null,
        avatarUrl:
          avatar ||
          `https://cdn.discordapp.com/embed/avatars/${Number(discrim) % 5}.png`,
        bannerUrl: bannerUrl || null,
      },
      connectedAccounts,
    };
  }
}