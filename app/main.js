

/*eateBrowser
main.js
This file is the entry point for our React application.
We use it in the gulpfile.js where Browserify will travers the
entire tree of dependencies and generate the final bundle.js file.

After intial setup you rarely have to touch this file.

Adding  a URL Listener and rendering the application
when it changes.
*/


import React from 'react';
//React Router bootstraps the routes from routes.js
import Router from 'react-router';
import ReactDOM from 'react-dom';
//createBrowserHistory Enables HTML5HistoryAPI in order to make pretty URLs
import createBrowserHistory from 'history/lib/createBrowserHistory';
import routes from './routes';

let history = createBrowserHistory();

ReactDOM.render(<Router history={history}>{routes}</Router>)
