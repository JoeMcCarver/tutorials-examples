const env = process.env;

export const nodeEnv = env.NODE_ENV || 'developement';

export const logStars = (message) => {
  var star = '';
  for (let i = 0; i < message.length; i++) {
    star += '*';
  }
  console.log(`${star}\n${message}\n${star}`);
};

export default {
  mongodbUri: 'mongodb://localhost:27017/test',
  port: env.PORT || 80,
  host: env.HOST || 'localhost',
  get serverUrl() {
    return `http://${this.host}:${this.port}`;
  }
};
