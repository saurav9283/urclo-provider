const amqp = require('amqplib');
// amqps://vtfzydcl:vuVcJ22Ur6D5JCJk343z65nxZZKkhP8A@moose.rmq.cloudamqp.com/vtfzydcl 
const RABBITMQ_URL = process.env.RABBIT_URL ||  'amqp://guest:guest@localhost:5672';

let connection, channel;

async function connect() {

    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
}

async function subscribeToQueue(queueName, callback) {
    if (!channel) await connect();
    await channel.assertQueue(queueName);
    channel.consume(queueName, (message) => {
        callback(message.content.toString());
        channel.ack(message);
    });
}

async function publishToQueue(queueName, data) {
    if (!channel) await connect();
    await channel.assertQueue(queueName);
    channel.sendToQueue(queueName, Buffer.from(data));
}

module.exports = {
    subscribeToQueue,
    publishToQueue,
    connect,
};