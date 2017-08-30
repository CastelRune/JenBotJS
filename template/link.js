const Discord = require('discord.js')

const client = new Discord.Client()
const config = require('./bot.json')

client.login(config.token)

client.on('ready', function () {
  console.log('Lien pour inviter le bot: https://discordapp.com/oauth2/authorize?client_id=' + client.user.id + '&scope=bot')
  process.exit(0)
})

client.on('error', function (err) {
  console.log(err)
  console.log('MDR')
})
