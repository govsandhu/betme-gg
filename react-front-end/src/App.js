import React, { Component } from 'react';
import { Route, Switch } from "react-router-dom";
import NavBar from './components/navbar/NavBar'
import Dashboard from './components/dashboard/Dashboard'
import Login from './components/Login'
import axios from 'axios'

import './App.css';
import './styles/styles.css';
import 'antd/dist/antd.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userInfo: {},
      userBets: [],
      userBetInformation: []
    }

    this.handleNotificationSelection = this.handleNotificationSelection.bind(this);
  }

  getUserBetsDetails() {
    axios.get('http://localhost:8080/users/:id', { withCredentials: true })
      .then((allInfo) => {
        let allData = allInfo.data;
        const bets = allData.bets;
        delete allData['bets']
        this.setState({
          userInfo: allData,
          userBets: bets
        });
        console.log("---------", this.state);
      })
      .catch((err) => {
        console.log(err)
      });
  }

  handleNotificationSelection = (id, truthy, notificationType) => {
    switch (notificationType) {
      case ("invite"):
        axios.put(`http://localhost:8080/notifications/${id}/termStatus`, { termStatus: truthy }, { withCredentials: true }).then(() => {
          // refresh notifications  
          this.getUserBetsDetails();
        });
        break;

      case ("teamSelect"):
        axios.put(`http://localhost:8080/notifications/${id}/teamSelect`, { teamSelect: truthy }, { withCredentials: true }).then(() => {
          // refresh notifications    
          this.getUserBetsDetails();
        });
        break;

      default:
        break;
    }
  }

  componentDidMount() {
    this.getUserBetsDetails();
  }

  render() {
    return (
      <div>
        <NavBar
          userBets={this.state.userBets}
          handleNotificationSelection={this.handleNotificationSelection}
          refreshComponent={this.getUserBetsDetails}
        />

        <Switch>
          <Route exact path='/' component={Dashboard} />
          <Route path='/login' component={Login} />
        </Switch>
      </div>
    );
  }
}

export default App;
