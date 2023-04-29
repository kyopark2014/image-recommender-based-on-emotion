const aws = require('aws-sdk');
const personalizeRuntime = new aws.PersonalizeRuntime();
const campaignArn = process.env.campaignArn

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event));
    
    const body = JSON.parse(Buffer.from(event["body"], "base64"));
    console.log('gardenRequestInfo: ' + JSON.stringify(body));

    let userId = body['id'];
    console.log('userId: ', userId);

    let emotion = body['emotion'];
    console.log('emotion: ', emotion);

    let isCompleted = false;
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

    let landscape = [];
    for(let i in recommendation['itemList']) {
        let itemStr = recommendation['itemList'][i].itemId;
        console.log("itemStr: ", itemStr);

        // const url = 'https://'+domainName+'/'+itemStr;
        const url = itemStr;
        console.log('url: ', url);

        const imgProfile = {
            url: url,
            emotion: emotion,
            // control: control
        }

        landscape.push(imgProfile);
    }
    console.log('landscape: ', JSON.stringify(landscape));
    
    let result = {
        landscape: landscape,
    }
    console.info('result: ', JSON.stringify(result));
    isCompleted = true;

    function wait() {
        return new Promise((resolve, reject) => {
            if (!isCompleted) {
                setTimeout(() => resolve("wait..."), 1000);
            }
            else {
                setTimeout(() => resolve("done..."), 0);
            }
        });
    }
    console.log(await wait());
    console.log(await wait());
    console.log(await wait());
    console.log(await wait());
    console.log(await wait());

    let response = {
        statusCode: 200,
        body: JSON.stringify(result)
    };
    console.debug('response: ', JSON.stringify(response));

    return response;
};

