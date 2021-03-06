import React, { Component } from 'react';
import { Form, Input, Icon, Button } from 'antd';

let id = 0;

class InviteFriends extends Component {
  remove = k => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    // We need at least one email
    if (keys.length === 1) {
      return;
    }
    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  };

  add = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(id++);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys: nextKeys,
    });
  };

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    };
    const formBtn = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 24, offset: 0 },
      },
    };
    getFieldDecorator('keys', { initialValue: [] });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => (
      <Form.Item
        {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
        label={index === 0 ? 'Email' : ''}
        required={true}
        key={k}
      >
        {getFieldDecorator(`emails[${k}]`, {
          validateTrigger: ['onChange', 'onBlur'],
          rules: [
            {
              required: true,
              whitespace: true,
              message: 'Add your friend\'s emails!',
            },
          ],
        })(<Input
          prefix={<Icon type="mail" style={{ color: '#fff' }} />}
          style={{ width: '90%', marginRight: '8px' }}
          className='email-field'
        />)}
        {keys.length > 1 ? (
          <Icon
            className='dynamic-delete-button'
            type='minus-circle-o'
            onClick={() => this.remove(k)}
          />
        ) : null}
      </Form.Item>
    ));
    return (
      <div>
        {formItems}
        <Form.Item {...formBtn}>
          <Button className='invite-friends' onClick={this.add}>
            Click here to invite your friends!
          </Button>
        </Form.Item>
      </div>
    );
  }
}

export default Form.create({ name: 'invite_friends' })(InviteFriends);
