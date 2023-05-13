# 추천 리스트 읽어오기

"감정 추천"은 감정에 따라 추천을 수행할 수 있도록 사전에 정의한 상호작용 데이터를 기반으로 추천을 수행하고, "개인화 추천"은 "감정 추천"을 통해 사용자의 상호작용 데이터가 충분히 확보되면 이를 기반으로 추천을 수행합니다. [lambda-gallery](./lambda-gallery/index.js)에서는 사용자의 id를 가지고 해당 사용자에 대한 추천 이미지 리스트를 가져올 수 있습니다.

PersonalizeRuntime을 이용하여 추천정보를 가져올 수 있습니다.

```java
const aws = require('aws-sdk');
const personalizeRuntime = new aws.PersonalizeRuntime();
```

[lambda-gallery](./lambda-gallery/index.js)에서는 Personalize로 추론(inference)을 요청합니다. 이때 [getRecommendations](https://docs.aws.amazon.com/personalize/latest/dg/API_RS_GetRecommendations.html)로 userId에 대한 추천 리스트를 가져옵니다.

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

[gallery](./html/gallery.js)에서는 "감정 추천"과 "개인화 추천"을 제공합니다. "감정 추천"의 경우에는 성별과 김정의 조합으로 추천을 수행합니다. 또한 추천시에 id기준으로 추천을 수행하는데 사용자의 감정에 맞는 추천을 하기 위해서 여기서는 사용자 아이디와 김정의 조합으로 추천을 수행합니다. 즉 사용자 한 명의 감정은 8가지로 분류되므로 상호작용으로 모아지는 사용자 아이디는 사용자당 최대 8개까지 저장될 수 있습니다. 

```java
if(type == 'emotionbase') {
    drawGallery(emotionValue, gender, `${gender}/${emotionValue}`);
}
else {  // userbase
    drawGallery(emotionValue, gender, `${userId}/${emotionValue}`);
}   
```
