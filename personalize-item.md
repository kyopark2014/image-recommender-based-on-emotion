# Personalize의 Item 정보 수집

감정 추천에 사용되는 이미지들은 Stable Diffusion과 같이 머신러닝을 통해 생성할 수도 있고, 다른 방법으로 수집된 이미지를 이용할 수 있습니다. 따라서, 여기에서는 이미지들이 S3에 저장될때 발생하는 put event를 이용하여 Item 정보를 수집합니다. 

## 아이템(Item) Metadata

이미지에 대한 하나의 아이템에 대한 메타 정보는 ITEM_ID, TIMESTAMP, EMOTION으로 아래와 같이 구성합니다. 


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

[lambda-putItem](./lambda-putItem/index.js)은 아래와 같이 [putItems](https://docs.aws.amazon.com/personalize/latest/dg/API_UBS_PutItems.html)을 이용하여 아이템에 대한 정보를 personalize에 전달합니다.

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

await personalizeevents.putItems(params).promise(); 
```
