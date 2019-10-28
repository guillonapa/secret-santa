import React from 'react';
import { Box, Button, Collapsible, Form, FormField, Grommet, Paragraph, Select } from 'grommet';
import { aruba } from 'grommet-theme-aruba';



class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: "",
      showKeyInput: false,
      showSecretPerson: false
    }
  }
  
  setUser(user) {
    this.setState({
      user,
      showKeyInput: true
    });
  }

  showSecret() {
    this.setState({
      showKeyInput: false,
      showSecretPerson: true
    });
  }

  render() {
    const { showKeyInput, showSecretPerson, user } = this.state;
      return (
        <Grommet theme={aruba}>
          <Box pad="large">
            <Box gap="medium" pad="medium"  round="small" animation="slideDown" width="medium" alignSelf="center" align="center">
              <h1>Welcome, Santa.</h1>
              <Box alignSelf="center" align="center">
                <Paragraph margin="none">
                  Select your name from the dropdown and enter
                  your unique key to reveal your secret.
                </Paragraph>
                <Paragraph>
                  You will only be able to use your key once.
                  If you need to remind yourself of your secret,
                  you will need to contact the administrator for
                  a new key.
                </Paragraph>
              </Box>
              <Box fill="horizontal">
                <Select
                  options={[
                    'Guillermo Narvaez Paliza', 
                    'Laura Broffman',
                    'Ana Sofia Narvaez Paliza',
                    'Jose Narvaez Paliza', 
                    'Jose Max Narvaez Paliza',
                    'Sofia Paliza Castilla',
                    'Guillermo Narvaez Lora'
                  ]}
                  value={user}
                  onChange={({ option }) => {this.setUser(option)}}
                />
              </Box>
              <Box fill="horizontal">
                <Collapsible fill="horizontal" direction="vertical" open={showKeyInput}>
                  <Box fill="horizontal" flex>
                    <Form onSubmit={() => this.showSecret()}>
                      <FormField name="key" label="" />
                      <Button type="submit" primary label="Reveal" />
                    </Form>
                  </Box>
                </Collapsible>
              </Box>
              <Box fill="horizontal">
                <Collapsible fill="horizontal" direction="vertical" open={showSecretPerson}>
                  <Box flex fill="horizontal" alignSelf="center" align="center">
                    <h3>You will give a present to:</h3>
                    <Box>
                      <p>Random Name</p>
                    </Box>
                  </Box>
                </Collapsible>
              </Box>
            </Box>
          </Box>
        </Grommet>
      );
  }
}

export default App;
