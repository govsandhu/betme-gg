const Express = require('express');
const App = Express();
const BodyParser = require('body-parser');
const cors = require('cors');
const PORT = 8080;
const WebSocket = require('ws');
const SocketServer = require('ws').Server;
const randomColor = require('randomcolor');
const uuidv1 = require('uuid/v1');
const http = require('http');
const httpServer = http.createServer(App);

const axios = require('axios');
require('dotenv').config()
const models = require('./models');
const Bet = models.Bet;
const UserBet = models.User_Bet;

const Op = require('sequelize').Op;

const cookieSession = require('cookie-session')
App.use(cookieSession({
  name: 'session',
  keys: ['horseracing', 'bumfights']
}))

const db = require('./config/db')

// Test db
db.authenticate()
  .then(() => {
    console.log('Connection to db has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Express Configuration
App.use(BodyParser.urlencoded({ extended: false }));
App.use(BodyParser.json());
App.use(Express.static('public'));
App.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// user routes 
App.use('/users', require('./routes/users'))

// bet routes
App.use('/bets', require('./routes/bets'))

// login routes
App.use('/login', require('./routes/login'))

//notification routes
App.use('/notifications', require('./routes/notifications'))

// profile routes
App.use('/profile', require('./routes/profile'))


httpServer.listen(PORT, '0.0.0.0', 'localhost', () => {
  // eslint-disable-next-line no-console
  console.log(`Express seems to be listening on port ${PORT} so that's pretty good 👍`);
});

checkWinnerAndUpdateWinStatus = () => {

  checkWinner = async (matchId) => {
    return await axios.get(`https://api.pandascore.co/matches/${matchId}?token=${process.env.TOKEN}`);
  }

  return Bet.findAll({
    where: { bet_status: 'active' },
    attributes: ['id', 'matchId'],
  }).then((bets) => {
    bets.forEach((bet) => {
      checkWinner(bet.dataValues.matchId).then(async (rez) => {
        if (rez.data.winner) {

          // decide if team1 or team2 is winner
          const teamz = rez.data.name.split(' vs ');
          const winner = teamz[0] === rez.data.winner.acronym ? 'Team1' : 'Team2';

          let totalStakes = 0;
          let totalWinners = 0;
          let winners = [];

          // update bet status
          await Bet.findOne({
            where: {
              id: bet.dataValues.id,
              matchId: bet.dataValues.matchId
            }
          }).then((thisBet) => {
            this.totalStakes = totalStakes;
            totalStakes = parseInt(thisBet.dataValues.participants) * thisBet.dataValues.stakes;
            return thisBet.update({ bet_status: 'completed' });
          });

          // update all user bets
          await UserBet.findAll({
            where: {
              bet_id: bet.dataValues.id
            }
          }).then((allUserBet) => {

            allUserBet.forEach((userBet) => {
              let winnerCheck = userBet.dataValues.teamSelect === winner;

              // bind this.totalWinners to the one outside of the scope
              this.totalWinners = totalWinners;
              winnerCheck && totalWinners++;

              // bind this.winners to the one outside of the scope
              this.winners = winners;
              winnerCheck && winners.push(userBet.dataValues.user_id);

              userBet.update({
                userWinStatus: winnerCheck ? true : false,
                notificationType: winnerCheck ? 'win' : 'loss',
                notificationRead: false
              });
            });

            this.totalWinners = totalWinners;
            this.winners = winners;
            let avgStakes = totalWinners ? (totalStakes / totalWinners) : 0;

            // update earnOrLost for each user
            allUserBet.forEach((userBet) => {
              if (userBet.dataValues.userWinStatus) {
                userBet.update({
                  earnOrLost: avgStakes - userBet.dataValues.earnOrLost
                });
              }
            });

          }).then(() => {
            let avgStakes = totalWinners ? (totalStakes / totalWinners) : 0;

            // update winner bank
            winners.forEach((winner) => {
              models.User.findOne({ where: { id: winner } }).then((thisUser) => {
                thisUser.update({ bank: thisUser.dataValues.bank + avgStakes });
              })
            })
          })
        }
      }).catch((err) => {
        console.log(err);
      });
    });
  });
}

checkPendingBetsAndStartTime = () => {
  return Bet.findAll({
    where: {
      bet_status: 'pending',
      start_time: {
        [Op.lte]: new Date()
      }
    },
    include: [{ model: models.User, as: 'users' }]
  }).then((bets) => {
    bets.forEach((bet) => {
      bet.update(
        {
          bet_status: 'cancelled'
        },
        {
          returning: true,
          plain: true
        }).then((rez) => {
          rez.dataValues.users.forEach((user) => {
            if (user.dataValues.User_Bet.notificationType === 'inProgress') {
              user.update({ bank: user.dataValues.bank + bet.dataValues.stakes })
            }
          });
        })
    })
  })
}

checkPendingBetsAndStartTime();
checkWinnerAndUpdateWinStatus();

setInterval(async () => {
  await checkPendingBetsAndStartTime();
  await checkWinnerAndUpdateWinStatus();
}, 10000);


// Create the WebSockets server
const wss = new SocketServer({ server: httpServer });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  console.log('Client connected');

  // sending color to client
  ws.send(JSON.stringify({ color: randomColor({ alpha: 1 }) }));

  wss.broadcast = function (data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
  wss.broadcast(JSON.stringify({ onlineUsers: wss.clients.size }));

  ws.on('message', function incoming(data) {
    const jsonData = JSON.parse(data);
    jsonData.id = uuidv1();
    jsonData.type = jsonData.type === 'postNotification' ? 'incomingNotification' : 'incomingMessage';

    wss.broadcast(JSON.stringify(jsonData));
  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    console.log('Client disconnected');
    wss.broadcast(JSON.stringify({ onlineUsers: wss.clients.size }));
  });
});
