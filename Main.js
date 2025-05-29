const App = require('./Modules/app');

class Main {
  static run() {
    const app = new App();
    app.listen(4000);
  }
}

Main.run();