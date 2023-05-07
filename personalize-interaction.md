# Personalize의 상호작용(interacion) 정보 수집

사용자의 event를 상호작용(interaction)으로 등록하여 개인화 추천에 사용합니다.

## 상호작용(interacion) Metadata

Personalize의 사용자(User)에 대한 메타 정보는 USER_ID, GENDER, EMOTION 으로 구성됩니다. 

```java
{
    "type": "record",
    "name": "Interactions",
    "namespace": "com.amazonaws.personalize.schema",
    "fields": [
        {
            "name": "USER_ID",
            "type": "string"
        },
        {
            "name": "ITEM_ID",
            "type": "string"
        },
        {
            "name": "TIMESTAMP",
            "type": "long"
        },
        { 
            "name": "EVENT_TYPE",
            "type": "string"
        },
        {
            "name": "IMPRESSION",
            "type": "string"
        }
    ],
    "version": "1.0"
}
```

## 상호작용 정보의 수집

[lambda-createUser](./lambda-createUser/index.js)에서는 DynamoDB에 기존에 이미 등록된 사용자가 있는지 확인하여 없는 경우에 Personalize에 사용자(User)로 등록합니다. 등록할때에는 [putUsers](https://docs.aws.amazon.com/personalize/latest/dg/API_UBS_PutUsers.html)를 사용합니다. 

