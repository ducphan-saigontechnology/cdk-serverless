import {Stack, StackProps, CfnOutput} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'


export class CdkServerlessStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // Create DynamoDB table
        const table = new dynamodb.Table(this, 'ProductTable', {
            tableName: 'ProductTable',
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });

        // Create the Lambda layer
        const layer = new lambda.LayerVersion(this, 'TestLayer', {
            code: lambda.Code.fromAsset('lambda/layer'),
        });


        // Create Lambda function
        const getAllHandler = new lambda.Function(this, 'getAllHandler', {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset('lambda/product'),
            handler: 'index.getAllProducts',
            environment: {
                TABLE_NAME: table.tableName,
            },
            layers: [layer]
        });
        const createHandler = new lambda.Function(this, 'createHandler', {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset('lambda/product'),
            handler: 'index.createProduct',
            environment: {
                TABLE_NAME: table.tableName,
            },
            layers: [layer]
        });
        const updateHandler = new lambda.Function(this, 'updateHandler', {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset('lambda/product'),
            handler: 'index.updateProduct',
            environment: {
                TABLE_NAME: table.tableName,
            },
            layers: [layer]
        });
        const deleteHandler = new lambda.Function(this, 'deleteHandler', {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset('lambda/product'),
            handler: 'index.deleteProduct',
            environment: {
                TABLE_NAME: table.tableName,
            },
            layers: [layer]
        });

        const getHandler = new lambda.Function(this, 'getHandler', {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset('lambda/product'),
            handler: 'index.getProduct',
            environment: {
                TABLE_NAME: table.tableName,
            },
            layers: [layer]
        });

        // Grant Lambda read/write permissions to DynamoDB table
        table.grantReadWriteData(getAllHandler);
        table.grantReadWriteData(createHandler);
        table.grantReadWriteData(updateHandler);
        table.grantReadWriteData(deleteHandler);
        table.grantReadWriteData(getHandler);

        // Create API Gateway
        const api = new apigateway.RestApi(this, 'ProductCrudAPI');

        // Create API Gateway resources
        const productsResource = api.root.addResource('products');
        const productResource = productsResource.addResource('{productId}');

        // Add GET method to retrieve all products
        const getAllProductsIntegration = new apigateway.LambdaIntegration(getAllHandler, {
            requestTemplates: {'application/json': '{ "statusCode": "200" }'},
        });
        productsResource.addMethod('GET', getAllProductsIntegration);

        // Add POST method to create a product
        const createProductIntegration = new apigateway.LambdaIntegration(createHandler, {
            requestTemplates: {'application/json': '{ "statusCode": "201" }'},
        });
        productsResource.addMethod('POST', createProductIntegration);

        // Add PUT method to update a product
        const updateProductIntegration = new apigateway.LambdaIntegration(updateHandler, {
            requestTemplates: {'application/json': '{ "statusCode": "200" }'},
        });
        productResource.addMethod('PUT', updateProductIntegration);

        // Add DELETE method to delete a product
        const deleteProductIntegration = new apigateway.LambdaIntegration(deleteHandler, {
            requestTemplates: {'application/json': '{ "statusCode": "204" }'},
        });
        productResource.addMethod('DELETE', deleteProductIntegration);

        // Add GET method to get a product by id
        const getProductIntegration = new apigateway.LambdaIntegration(getHandler, {
            requestTemplates: {'application/json': '{ "statusCode": "204" }'},
        });
        productResource.addMethod('GET', getProductIntegration);

        // Output the API Gateway URL
        new CfnOutput(this, 'APIGatewayURL', {
            value: api.url,
        });


    }
}
