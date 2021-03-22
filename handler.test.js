const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');

const handler = require('./handler.js');

describe('API post endpoint', () => {
  beforeEach(() => {
    AWSMock.restore();
  });

  process.env.DYNAMODB_TABLE = 'test';

  const mockPayload = (overrides) => {
    return {
      body: JSON.stringify({
        attending: 'yes',
        name: 'testName',
        people: 'Person1, Person2',
        diet: 'None',
        song: 'Final Countdown',
        ...overrides,
      }),
    };
  };

  it('should return 400 if no name in payload', async () => {
    const result = await handler.rsvp(mockPayload({ name: '' }));

    expect(result).toEqual({
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://mikeandeleni.com',
      },
      body: "Couldn't process rsvp. No name provided",
    });
  });

  it('should call db put with payload and return 200 on success', async () => {
    const mockDbCall = jest.fn().mockReturnValue(Promise.resolve());

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'put', mockDbCall);

    const result = await handler.rsvp(mockPayload());

    expect(mockDbCall).toHaveBeenCalled();

    expect(mockDbCall.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        Item: expect.objectContaining({
          attending: 'yes',
          diet: 'None',
          name: 'testName',
          people: 'Person1, Person2',
          song: 'Final Countdown',
        }),
        TableName: 'test',
      })
    );

    expect(result).toEqual(
      expect.objectContaining({
        statusCode: 200,
      })
    );
  });

  it('should call db put with payload and return 500 on error', async () => {
    const mockDbCall = jest.fn().mockReturnValue(Promise.reject());

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'put', mockDbCall);

    const result = await handler.rsvp(mockPayload());

    expect(mockDbCall).toHaveBeenCalled();

    expect(mockDbCall.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        Item: expect.objectContaining({
          attending: 'yes',
          diet: 'None',
          name: 'testName',
          people: 'Person1, Person2',
          song: 'Final Countdown',
        }),
        TableName: 'test',
      })
    );

    expect(result).toEqual(
      expect.objectContaining({
        statusCode: 500,
      })
    );
  });
});
