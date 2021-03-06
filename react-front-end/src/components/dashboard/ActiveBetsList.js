import React, { Component } from "react";
import ActiveBet from "./ActiveBets"

class ActiveBetList extends Component {

  render() {

    const activeBets = this.props.activeBets.map(activeBet => {
      return (
        <ActiveBet
          key={activeBet.id}
          betId={activeBet.id}
          team1={activeBet.team1FullName}
          team2={activeBet.team2FullName}
          stakes={activeBet.stakes}
          owner={activeBet.owner}
          betStatus={activeBet.bet_status}
          game={activeBet.game}
          participants={activeBet.participants}
        />
      );
    });
    

    return (
      <div className='bets'>
        <div className='title'>
          <h2>Active bets</h2>
        </div>
        {activeBets}
      </div>
    );
  }
}

export default ActiveBetList;
