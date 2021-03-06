import React, { Component } from 'react';
import { Drawer, Form, Button, Col, Row, InputNumber } from 'antd';
import axios from 'axios';
import MatchPicker from './MatchPicker'
import InviteFriends from './InviteFriends'


class NewBet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    }
  }

  showNewBet = () => {
    this.setState({
      visible: true,
    });
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    let props = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // get the right game info based on the match name
        const gameInfo = this.props.upcomingMatches.filter((match) => match.name === values.match);
        // filter returns an array, get the first one and save the game type
        values.game = gameInfo[0].videogame.name;
        // split the match to get the team names and save them to values
        let teams = gameInfo[0].name.split(' vs ');
        values.team1 = teams[0];
        values.team2 = teams[1];
        values.team1FullName = gameInfo[0].opponents[0].opponent.name;
        values.team2FullName = gameInfo[0].opponents[1].opponent.name;
        values.start_time = gameInfo[0].begin_at;
        values.team1logo = gameInfo[0].opponents[0].opponent.image_url;
        values.team2logo = gameInfo[0].opponents[1].opponent.image_url;
        values.matchId = gameInfo[0].id;

        const emails = values.emails.filter((email) => !!email);
        values.emails = emails;

        axios.post('http://localhost:8080/bets', values, { withCredentials: true })
          .then((response) => {
            props.refreshComponent();
            props.form.resetFields();
            this.onClose();
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Button type='primary' onClick={this.showNewBet}>
          New Bet
        </Button>
        <Drawer
          title='Create a new bet!'
          width={350}
          className='new-bet'
          onClose={this.onClose}
          visible={this.state.visible}
        >
          <Form layout='vertical' hideRequiredMark>
            <Row type='flex'>
              <Col span={24}>
                <MatchPicker form={this.props.form} upcomingMatches={this.props.upcomingMatches} />
              </Col>
            </Row>
            <Row type='flex'>
              <Col span={24}>
                <Form.Item label={'GG Coins: ' + this.props.bank + ' -  Place your bet'}>
                  {getFieldDecorator('stakes', { initialValue: 10 })(
                    <InputNumber
                      min={0}
                      max={this.props.bank}
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row type='flex'>
              <Col span={24}>
                <InviteFriends form={this.props.form} />
              </Col>
            </Row>
            <div className='new-bet-actions'>
              <Button onClick={this.handleSubmit} type='primary'>
                Create Bet!
              </Button>
            </div>
          </Form>
        </Drawer>
      </div>
    );
  }
}

export default Form.create()(NewBet);
