# lightning-chess
Play chess on the Lightning Network.

This project allows you to play chess against others and win satoshis. Early on in the days of Lightning there were some projects that built a chess app on LN, (some discussions can be found [here](https://www.reddit.com/r/lightningnetwork/comments/ao5ccm/play_chess_for_bitcoin_on_the_lightning_network/) and [here](https://www.chess.com/forum/view/clubs-and-teams/play-with-bitcoin-49000316)), but since those projects don't seem to exist anymore, I decided to build this prototype.

I took heavy inspiration from the [Lightning Labs sample LAPP](https://github.com/lightninglabs/builders-guide-sample-app/tree/final). The demo can be tested locally by using [Polar](https://docs.lightning.engineering/lapps/guides/polar-lapps). 

## Demo

Here's how you can connect your node to the app. In this demo, I'm using Polar:

https://user-images.githubusercontent.com/20623695/194784558-b686a2ca-5d92-411d-896f-b34e32be8c41.mov

[YouTube](https://youtu.be/ftCplUN63Gc)

Once 2 players have connected, start a game by sharing a URL (just like playing with a friend in [Lichess](https://lichess.org/)). Once both players have paid 1000 satoshis, the game begins. The winner will get paid back 2000 satoshis when the game is over.

https://user-images.githubusercontent.com/20623695/194784551-f487d9d6-c789-44e3-af3e-245a0efd121a.mov

[YouTube](https://youtu.be/YLC89wi4KP0)
## Getting Started
To run it locally, pull the repo and install [Polar](https://lightningpolar.com/) (follow instructions [here](https://docs.lightning.engineering/lapps/guides/polar-lapps/local-cluster-setup-with-polar)). Also make sure that you have Go >1.19.

1. Create a network like in the Lightning Labs tutorial. You can also import the `lightning-chess-simnet.polar.zip` simnet.
2. Create a `.env` file in `backend/` and include the `LND_HOST`, `LND_CERT`, and `LND_MACAROON` (admin macaroon) from one of the nodes in the simnet. This node will belong to the backend.
3. Install dependencies:
```
$ cd backend
$ go get .
$ cd ../client
$ npm install
```

To run the backend, run: 
```
$ cd backend
$ air
```

And to run the client, in a seperate terminal window, run:
```
$ cd client
$ npm run start
```
## How it works
1. Each user connects their node using the Host, TLS Certificate, and Macaroon.
2. To begin a game, both players have to pay 1000 satoshis. On the backend, the backend LND node is creating invoices, and sending each client their respective Payment Request.
3. On the backend, we are subscribed to any invoice activity on our node. Once those invoices are settled by the users, the game can begin.
4. The game is played until one of the players wins. Once they do, we generate an invoice for 2000 satoshis on their behalf, and pay it from our backend node.
## Next steps
This is a simple prototype. Some next steps include: 
1. Making the chess interface much better (move history, timed games, chat, pre-moves, etc...)
2. Add proper persistance and clean up the code
3. Detecting different game outcomes. In the event of a draw, both players should get their sats back.
4. Using HODL invoices and an escrow in order to minimize the trust in the third-party. Here are some resources:
    - <https://lists.linuxfoundation.org/pipermail/lightning-dev/2016-January/000403.html>
    - <https://www.reddit.com/r/lightningnetwork/comments/pgkkrq/are_escrow_payments_feasible_with_the_ln/>
    - <https://stacker.news/items/7340>
    - <https://suredbits.com/payment-points-part-3-escrow-contracts/>
    - <https://lists.linuxfoundation.org/pipermail/lightning-dev/2019-June/002051.html>
    - <https://github.com/supertestnet/hodlcontracts>
5. Launch it!
## Resources

- [A sample LN app with Golang that I used for reference, albeit a bit outdated](https://github.com/philippgille/ln-paywall)
- [The LND RPC reference](https://api.lightning.community/)
- [Collection of cool LN projects](https://github.com/bcongdon/awesome-lightning-network)
- [The LNRPC package. Make sure you use this version, and not the "latest" one](https://pkg.go.dev/github.com/lightningnetwork/lnd@v0.15.1-beta/lnrpc#section-readme)
