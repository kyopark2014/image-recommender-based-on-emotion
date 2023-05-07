# 추천 리스트 읽어오기

[lambda-garden](./lambda-garden/index.js)에서는 사용자의 id를 가지고 해당 사용자에 대한 추천 이미지 리스트를 가져올 수 있습니다.

PersonalizeRuntime을 이용하여 추천정보를 가져올 수 있습니다.

```java
const aws = require('aws-sdk');
const personalizeRuntime = new aws.PersonalizeRuntime();
```

[lambda-gallery](./lambda-gallery/index.js)에서는 Personalize로 추론(inference)요청니다. 이때 [getRecommendations](https://docs.aws.amazon.com/personalize/latest/dg/API_RS_GetRecommendations.html)로 userId에 대한 추천 리스트를 가져옵니다.

```java
let userId = body['id'];
    
let recommendationParams = {
    campaignArn: campaignArn,
    userId: userId
};

let recommendation; 
try {
    recommendation = await personalizeRuntime.getRecommendations(recommendationParams).promise();
    console.log ('recommendation: ', JSON.stringify(recommendation));
} catch (error) {
    console.log(error);
    return;
}  
```

추천정보는 itemList로 내려오므로 "recommendation['itemList']"로 리스트 정보를 확인할 수 있습니다.  

```java
let result = [];
for (let i in recommendation['itemList']) {
    let itemStr = recommendation['itemList'][i].itemId;
    console.log("itemStr: ", itemStr);

    const url = itemStr;
    console.log('url: ', url);

    const imgProfile = {
        url: url,
    };

    result.push(imgProfile);
}

let response = {
    statusCode: 200,
    body: JSON.stringify(result)
};

return response;
```    
