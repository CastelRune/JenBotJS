#!/usr/bin/env node --harmony

var program = require('commander')
var co = require('co')
var prompt = require('co-prompt')
var fs = require('fs')
var path = require('path')
var exec = require('child_process').exec

var command
var argument

program
.version('0.1.0')
  .arguments('<command> [argument]')
  .action(function (arg1, arg2) {
    command = arg1
    argument = arg2
  })
  .parse(process.argv)

var dir = process.cwd()

if (typeof command === 'undefined') {
  console.log('')
  console.log('Jenbot-CLI by Jaymun723')
  console.log('')
  console.log('  jb new      Pour créer les fichiers de base du bot.')
  console.log('  jb build    Pour construire le bot.')
  console.log('  jb token    Pour changer le token du bot.')
  console.log('  jb prefix   Pour changer le prefix du bot.')
  console.log('  jb commands Pour gérer les commandes.')
  process.exit(0)
} else if (command === 'new') {
  co(function * () {
    var name = yield prompt('Nom du bot: ')
    var token = yield prompt('Token du bot: ')
    var prefix = yield prompt('Prefix pour les commandes du bot (\'mention\' pour avoir une mention comme prefix): ')
    var verbose = yield prompt('Message sur la console après une command (true ou false): ')

    if (verbose !== 'true' || verbose !== 'false') {
      verbose = true
    }

    // Create bot.json file
    var botconf = '{\n  "name": "' + name + '",\n  "token": "' + token + '",\n  "prefix": "' + prefix + '",\n  "console_on_command": ' + verbose + '\n}'
    fs.writeFileSync(path.join(dir, 'bot.json'), botconf)

    // Create package.json file
    fs.writeFileSync(path.join(dir, 'package.json'), fs.readFileSync(path.join(__dirname, 'template', 'package.json')))

    // Create index.js file
    fs.writeFileSync(path.join(dir, 'index.js'), fs.readFileSync(path.join(__dirname, 'template', 'index.js')))

    // Create link.js file
    fs.writeFileSync(path.join(dir, 'link.js'), fs.readFileSync(path.join(__dirname, 'template', 'link.js')))

    // Create events files
    fs.mkdirSync(path.join(dir, 'events'))
    fs.writeFileSync(path.join(dir, 'events', 'commands_handller.js'), fs.readFileSync(path.join(__dirname, 'template', 'events', 'commands_handler.js')))
    fs.writeFileSync(path.join(dir, 'events', 'ready.js'), fs.readFileSync(path.join(__dirname, 'template', 'events', 'ready.js')))
    fs.writeFileSync(path.join(dir, 'events', 'welcome_message.js'), fs.readFileSync(path.join(__dirname, 'template', 'events', 'welcome_message.js')))

    // Create commands files
    fs.mkdirSync(path.join(dir, 'commands'))
    fs.writeFileSync(path.join(dir, 'commands', 'not_found.js'), fs.readFileSync(path.join(__dirname, 'template', 'commands', 'not_found.js')))
    fs.writeFileSync(path.join(dir, 'commands', 'ping.js'), fs.readFileSync(path.join(__dirname, 'template', 'commands', 'ping.js')))

    console.log('')
    console.log(`Bot ${name} initialisé faîtes 'jb build' pour le construire.`)
    process.exit(0)
  })
} else if (command === 'build') {
  if (fs.existsSync(path.join(dir, 'bot.json')) && fs.existsSync(path.join(dir, 'package.json'))) {
    console.log('Build en cours...')
    exec('npm install', function (error, stdout, stderr) {
      if (error) return console.error('Une erreur est survenue lors de l\'installation des module npm:\n' + error)
      console.log('Modules npm installés...')
      console.log('Test du token...')
      console.log('Si rien ne se passe au bout de quelques secondes c\'est que le token est invalide (Ctrl + C pour stopper le build).')
      exec('node link.js', function (error, stdout, stderr) {
        if (error) return console.error('une erreur est survenue lors du lancement de script getlink:\n' + error)
        if (stdout === undefined) return console.error('Toekn invalide...')
        console.log(stdout)
        console.log('Bot construit avec succès !')
        process.exit(0)
      })
    })
  } else {
    console.error('Impossible de trouver les fichiers \'bot.json\' et \'package.json\'')
  }
} else if (command === 'token') {
  if (fs.existsSync(path.join(dir, 'bot.json'))) {
    if (argument !== undefined) {
      let botconf = JSON.parse(fs.readFileSync(path.join(dir, 'bot.json'), 'utf8'))
      botconf.token = argument
      fs.writeFile(path.join(dir, 'bot.json'), JSON.stringify(botconf), function (err) {
        if (err) {
          console.error(err)
        } else {
          console.log('Token changé avec succès !')
          process.exit(0)
        }
      })
    }
    co(function * () {
      var token = yield prompt('Token du bot: ')
      let botconf = JSON.parse(fs.readFileSync(path.join(dir, 'bot.json'), 'utf8'))
      botconf.token = token
      fs.writeFile(path.join(dir, 'bot.json'), JSON.stringify(botconf), function (err) {
        if (err) {
          console.error(err)
        } else {
          console.log('Token changé avec succès !')
          process.exit(0)
        }
      })
    })
  } else {
    console.error('Impossible de trouver le fichier \'bot.json\'')
  }
} else if (command === 'prefix') {
  if (fs.existsSync(path.join(dir, 'bot.json'))) {
    co(function * () {
      var prefix = yield prompt('Prefix du bot: ')
      let botconf = JSON.parse(fs.readFileSync(path.join(dir, 'bot.json'), 'utf8'))
      botconf.prefix = prefix
      fs.writeFile(path.join(dir, 'bot.json'), JSON.stringify(botconf), function (err) {
        if (err) {
          console.error(err)
        } else {
          console.log('Prefix changé avec succès !')
          process.exit(0)
        }
      })
    })
  } else {
    console.error('Impossible de trouver le fichier \'bot.json\'')
  }
} else if (command === 'launch') {
  if (fs.existsSync(path.join(dir, 'index.js'))) {
    console.log('Faîtes \'node index.js\' pour lancer le bot.')
  } else {
    console.error('Impossible de trouver le fichier \'index.js\'')
  }
} else if (command === 'commands') {
  if (argument === 'new') {
    co(function * () {
      var name = yield prompt('Nom de la commande: ')
      var resultType = yield prompt('Type de résultat (Pour l\'instant que \'text\'): ')
      if (resultType === 'text') {
        var result = yield prompt('Texte à afficher (mettre les \' avec un \\ devant pour éviter les problèmes): ')
        if (fs.existsSync(path.join(dir, 'commands'))) {
          var commandText = 'exports.run = function (client, message, args, config) {\n  message.channel.send("' + result + '")\n}\n'
          fs.writeFileSync(path.join(dir, 'commands', `${name}.js`), commandText)
          console.log('Commande crée avec succès !')
          process.exit(0)
        } else {
          console.error('Impossible de trouver le dossier \'commands\'...')
          process.exit(1)
        }
      } else {
        console.error('type inconnu.')
        process.exit(1)
      }
    })
  } else if (argument === 'list') {
    if (fs.existsSync(path.join(dir, 'commands'))) {
      var commands = fs.readdirSync(path.join(dir, 'commands'))
      console.log('Commandes: ')
      commands.forEach(function (scommand) {
        scommand = scommand.replace('.js', '')
        console.log(`- ${scommand}`)
      })
    } else {
      console.error('Impossible de trouver le dossier \'commands\'')
    }
  } else if (argument === 'remove') {
    if (fs.existsSync(path.join(dir, 'commands'))) {
      co(function * () {
        var name = yield prompt('Nom de la commande a supprimer: ')
        fs.unlink(path.join(dir, 'commands', `${name}.js`), function (err) {
          if (err) {
            console.error('Commande introuvable...')
            process.exit(1)
          } else {
            console.log('Commande supprimée !')
            process.exit(0)
          }
        })
      })
    } else {
      console.error('Impossible de trouver le dossier \'commands\'')
    }
  } else {
    console.log('Liste des actions possible avec \'commands\'')
    console.log('')
    console.log('- jb commands new     Pour créer une commande.')
    console.log('- jb commands list    Pour avoir la liste des commandes.')
    console.log('- jb commands remove  Pour supprimer une commande.')
  }
} else {
  console.log('Commande inconnue...')
}
