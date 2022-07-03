const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err=>{
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
    process.exit(1); // 0 stands for success, and 1 stands for uncalled exception
}); 

dotenv.config({ path: './config.env' });
const app = require('./app');


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
}).then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;

const server =app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`App running on port ${port}...`);
});

//Handle unhandled rejections
process.on('unhandledRejection', err=>{
  console.log(err.name, err.message);
  console.log('UNHANDLER REJECTION! 💥 Shutting down...');

//By calling server.close we give the server time to finish all the requests that are still pending, and only after that the server is killed (process.exit(1))
  server.close(()=>{
    process.exit(1); // 0 stands for success, and 1 stands for uncalled exception
    });
});

