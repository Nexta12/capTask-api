import pino from "pino";

const logger = pino({
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: {
          destination: "./logs/output.log",
          translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
          ignore: "pid,hostname",
          mkdir: true,
          colorize: false,
        },
      },
      {
        target: "pino-pretty",
        options: {
          destination: process.stdout.fd,
          translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
    ],
  },

});

export default logger;
