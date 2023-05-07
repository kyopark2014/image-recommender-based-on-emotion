# Personalize의 User 정보 수집

사용자 정보의 수집

## 사용자(User) Metadata

사용자에 대한 메타 정보는 USER_ID, GENDER, EMOTION 으로 구성됩니다. 

```java
{
    "type": "record",
    "name": "Users",
    "namespace": "com.amazonaws.personalize.schema",
    "fields": [
        {
            "name": "USER_ID",
            "type": "string"
        },
        {
            "name": "GENDER",
            "type": "string",
            "categorical": true
        },
        {
            "name": "EMOTION",
            "type": "string",
            "categorical": true
        }
    ],
    "version": "1.0"
}
```


## 사용자 정보의 수집

[lambda-createUser](./lambda-createUser/index.js)에서는 DynamoDB에 기존에 이미 등록된 사용자가 있는지 확인하여 없는 경우에 Personalize에 사용자(User)로 등록합니다. 등록할때에는 [putUsers](https://docs.aws.amazon.com/personalize/latest/dg/API_UBS_PutUsers.html)를 사용합니다. 

```java
let queryParams = {
    TableName: userTableName,
    KeyConditionExpression: "USER_ID = :userId",
    ExpressionAttributeValues: {
        ":userId": userId
    }
};

let dynamoQuery = await dynamo.query(queryParams).promise();

if (!dynamoQuery.Count) {
    // Personalize
    var params = {
        datasetArn: datasetArn,
        users: [{
            userId: userId,
            properties: {
                "GENDER": gender,
                "EMOTION": emotion
            }
        }]
    };
    await personalizeevents.putUsers(params).promise();
}
```
