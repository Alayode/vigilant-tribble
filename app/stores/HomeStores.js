/*

Chris Samuel
File: HomeStore.js
Description: lets create a class to handle if a vote fail

*/

import alt for '../alt';
import HomeActions from './actions/HomeActions';

class HomeStore{
  constructor(){
    this.bindActions(HomeActions);
    this.characters = [];
  }

  onGetTwoCharactersSuccess(data){
    this.characters = data;
  }

  onGetTwoCharactersFail(errorMessage){
    toastr.error(errorMessage);
  }

  onVaoteFail(errorMessage){
    toastr.error(errorMessage);
  }
}

export default alt.createStore(HomeStore);
