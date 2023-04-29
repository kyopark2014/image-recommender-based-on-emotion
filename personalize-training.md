# Personalize 학습

## Event Tracker 설정 

Personalize에서 User와 Interaction 데이터를 수집하기 위해서는 Event Tracker를 생성하여야 합니다. [Data Group Console](https://ap-northeast-2.console.aws.amazon.com/personalize/home?region=ap-northeast-2#datasetGroups)로 진입하여, 아래와 같이 "image-recommender-dataset"을 선택합니다. 이후 [Create event tracker]를 선택합니다. 

![noname](https://user-images.githubusercontent.com/52392004/235288753-56861bb5-33f8-42d6-8f2b-9db63ea2ebc1.png)

[Configure tracker]에서 아래와 같이 [Tracker name]으로 "image-recommender-event-tracker"라고 입력후 [Next]를 선택하고, [Finish]를 선택합니다.

![noname](https://user-images.githubusercontent.com/52392004/235288895-e64a2799-6070-4d5b-9929-33e31f384a13.png)

왼쪽 메뉴의 [Event trackers]를 선택한 후에 "image-recommender-event-tracker"를 선택하면, 아래와 같이 Tracking ID를 확인할 수 있습니다. 아래와 같이 여기에서는 Tracking ID가 "326c8489-2683-420c-b7eb-4ac44bde346d"임을 알 수 있습니다.

![noname](https://user-images.githubusercontent.com/52392004/235289151-d19d0cc7-7e61-4acc-8faf-fde2083d9b16.png)

[lambda-like Console](https://ap-northeast-2.console.aws.amazon.com/lambda/home?region=ap-northeast-2#/functions/lambda-like?tab=configure)의 [Configuration]으로 접속하여 아래와 같이 "trackingId"으로 "326c8489-2683-420c-b7eb-4ac44bde346d"임을 입력합니다. 

![noname](https://user-images.githubusercontent.com/52392004/235289614-75af2fcd-5c52-491a-a47b-ffe4db8f7158.png)









### S3의 퍼미션 추가

[S3 console](https://s3.console.aws.amazon.com/s3/buckets?region=ap-northeast-1&region=ap-northeast-1)로 진입한 후에, 데모에 사용되는 bucket인 "emotion-gallery"을 선택합니다. 

이후 [Permission]메뉴에서 [Bucket policy]를 선택후 아래와 같이 수정합니다. 현재 해당 Bucket은 CloudFront의 Origin의 역할을 하고 있어서, Principle에 CloudFront가 추가되어 있지만, CloudFront를 사용하지 않을 경우에는 S3에 대한 Priciple, Action, Resouces를 추가하면 됩니다.


```java
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "personalize.amazonaws.com",
                "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity E2IK80DBQT2AVI"
            },
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::emotion-gallery",
                "arn:aws:s3:::emotion-gallery/*"
            ]
        }
    ]
}
```
