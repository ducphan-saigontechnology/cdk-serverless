const AWS = require('aws-sdk');
const uuid = require('uuid')

const {hello} = require('/opt/nodejs/common/foo.js')


const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.getAllProducts = async (event, context) => {
    try {
        const params = {
            TableName: process.env.TABLE_NAME,
        };
        hello()
        const result = await dynamodb.scan(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify(result.Items),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(error.message),
        };
    }
};

exports.getProduct = async (event, context) => {
    try {
        const { productId } = event.pathParameters;

        const params = {
            TableName: process.env.TABLE_NAME,
            Key: { id: productId },
        };

        const result = await dynamodb.get(params).promise();

        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Product not found' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result.Item),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(error.message),
        };
    }

};

exports.createProduct = async (event, context) => {
    try {
        console.log({event}, JSON.stringify(event))
        const { name, price } = JSON.parse(event.body);

        const params = {
            TableName: process.env.TABLE_NAME,
            Item: { id: uuid.v4(), name, price },
        };

        await dynamodb.put(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Product created successfully' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(error.message),
        };
    }

};

exports.updateProduct = async (event, context) => {
    try {
        const { productId } = event.pathParameters;
        const { name, price } = JSON.parse(event.body);

        const params = {
            TableName: process.env.TABLE_NAME,
            Key: { id: productId },
            UpdateExpression: 'set #name = :name, #price = :price',
            ExpressionAttributeNames: {
                '#name': 'name',
                '#price': 'price',
            },
            ExpressionAttributeValues: {
                ':name': name,
                ':price': price,
            },
            ReturnValues: 'UPDATED_NEW',
        };

        const result = await dynamodb.update(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify(result.Attributes),
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(error.message),
        };
    }
};

exports.deleteProduct = async (event, context) => {
    try {
        const { productId } = event.pathParameters;

        const params = {
            TableName: process.env.TABLE_NAME,
            Key: { id: productId },
        };

        await dynamodb.delete(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Product deleted successfully' }),
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(error.message),
        };
    }
};
