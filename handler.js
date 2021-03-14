'use strict';
const AWS = require('aws-sdk');
const uuid = require('uuid');

const db = new AWS.DynamoDB.DocumentClient();

module.exports.rsvp = async (event) => {
  const data = JSON.parse(event.body);
  const { name, people, diet, song } = data;

  if (name === '') {
    console.error('No name provided');
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://mikeandeleni.com',
      },
      body: "Couldn't process rsvp. No name provided",
    };
  }

  const timestamp = Date.now();

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v1(),
      createdAt: timestamp,
      updatedAt: timestamp,
      name,
      people,
      diet,
      song,
    },
  };

  try {
    await db.put(params).promise();
  } catch (e) {
    console.error(e);
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://mikeandeleni.com',
    },
    body: JSON.stringify({
      message: `Successfully processed ${name}'s rsvp`,
      item: params,
    }),
  };
};
