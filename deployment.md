# 인프라 생성하기

## Cloud9 생성 

여기서는 Tokyo Resion에서 인프라를 구축합니다. [Cloud9 Console](https://ap-northeast-2.console.aws.amazon.com/cloud9control/home?region=ap-northeast-2#/create)에 접속하여 [Create environment] 이름으로 "Image Recommender"를 입력하고, EC2 instance는 편의상 "m5.large"를 선택합니다. 나머지는 기본값을 유지하고, 하단으로 스크롤하여 [Create]를 선택합니다.

![noname](https://user-images.githubusercontent.com/52392004/235278681-5981b545-0cb0-46a8-b2ea-e9c13a2b4ff4.png)

아래와 같이 터미널을 Open합니다. 

![noname](https://user-images.githubusercontent.com/52392004/226772282-4964a05a-5b88-4f0a-81bc-2af208c880b1.png)


## CDK로 인프라 설치하기

소스를 다운로드 합니다.

```java
git clone https://github.com/kyopark2014/emotion-gallery
```

관련된 라이브러리를 설치합니다. 

```java
git clone https://github.com/kyopark2014/emotion-gallery && npm install
```

Account ID를 확인합니다. 

```java
aws sts get-caller-identity --query Account --output text
```

아래와 같이 bootstrap을 수행합니다. bootstrap을 1회만 수행하면 됩니다.

```java
cdk bootstrap aws://123456789012/ap-northeast-2
```

[Stable Diffusion 인프라 설치](./stable-diffusion-deployment.md)에서 얻은 Endpoint의 이름을 아래와 같이 업데이트 합니다.


왼쪽 메뉴에서 "emotion-gallery/cdk-emotion-gallery/cdk-emotion-gallery-stack.ts"을 열어서 아래의 bucket 이름을 변경합니다. 

![noname](https://user-images.githubusercontent.com/52392004/226772955-e4097752-0216-4bf4-ada6-826463d89356.png)

이제 cdk로 인프라를 설치합니다. 

```java
cdk deploy
```




Custom Domain이 없으므로, Cloud9에서 "emotion-gallery/cdk-emotion-gallery/lib/cdk-emotion-gallery-stack.ts"을 열어서, 아래와 같이 CloudFront의 도메인 정보를 업데이트합니다. 

![noname](https://user-images.githubusercontent.com/52392004/226774406-b3fd0981-8e47-4b7c-9860-11743247e284.png)

업데이트된 domain 정보를 반영하기 위하여 아래와 같이 다시 설치합니다.

```java
cdk deploy
```



<!--
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
-->
