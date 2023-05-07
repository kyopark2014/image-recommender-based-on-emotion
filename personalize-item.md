# Personalize의 Item 정보 수집

## 아이템(Item) Metadata

### Schema

```java
{
    "type": "record",
    "name": "Items",
    "namespace": "com.amazonaws.personalize.schema",
    "fields": [
        {
            "name": "ITEM_ID",
            "type": "string"
        },
        {
            "name": "TIMESTAMP",
            "type": "long"
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

## 구현

[lambda-putItem](https://github.com/kyopark2014/emotion-garden/blob/main/lambda-putItem/index.js)에서 사용자 정보를 personalize에 전달합니다.

```java
var params = {
    datasetArn: datasetArn,
    items: [{
        itemId: key,
        properties: {
            "TIMESTAMP": timestamp,
            "EMOTION": searchKey,
        }
    }]
};
console.log('user params: ', JSON.stringify(params));

const result = await personalizeevents.putItems(params).promise(); 
console.log('putItem result: '+JSON.stringify(result));
```
