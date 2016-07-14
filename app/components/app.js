// Using ES6 , React and Flux
// We will create (Client-Side) Routes


import React from 'react';


class App extends React.Component {
  render(){
    return(
      <div>{this.props.children}</div>
    );
  }
}


export default App;
