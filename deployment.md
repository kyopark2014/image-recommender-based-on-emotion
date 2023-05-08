# 인프라 생성하기

## Cloud9 생성 

[Cloud9 Console](https://ap-northeast-2.console.aws.amazon.com/cloud9control/home?region=ap-northeast-2#/create)에 접속하여 [Create environment] 이름으로 "Image Recommender"를 입력하고, EC2 instance는 편의상 "m5.large"를 선택합니다. 나머지는 기본값을 유지하고, 하단으로 스크롤하여 [Create]를 선택합니다.

![noname](https://user-images.githubusercontent.com/52392004/235278681-5981b545-0cb0-46a8-b2ea-e9c13a2b4ff4.png)

[Environment]에서 "Image Generator"를 [Open]한 후에 아래와 같이 터미널을 실행합니다. 

![noname](https://user-images.githubusercontent.com/52392004/226772282-4964a05a-5b88-4f0a-81bc-2af208c880b1.png)


## CDK로 인프라 설치하기

소스를 다운로드 합니다.

```java
git clone https://github.com/kyopark2014/image-recommender-based-on-emotion
```

관련된 라이브러리를 설치합니다. 

```java
cd image-recommender-based-on-emotion/cdk-image-recommender/ && npm install
```

Account ID를 확인합니다. 

```java
aws sts get-caller-identity --query Account --output text
```

아래와 같이 bootstrap을 수행합니다. 여기서 "account-id"는 상기 명령어로 확인한 12자리의 Account ID입니다. bootstrap 1회만 수행하면 되므로, 기존에 cdk를 사용하고 있었다면 bootstrap은 건너뛰어도 됩니다. 

```java
cdk bootstrap aws://account-id/ap-northeast-2
```

Cloud9의 왼쪽 메뉴에서 "emotion-gallery/cdk-emotion-gallery/cdk-emotion-gallery-stack.ts"을 오픈후에 [Stable Diffusion 인프라 설치](./stable-diffusion-deployment.md)에서 얻은 Endpoint의 이름을 아래와 같이 업데이트 합니다.

![noname](https://user-images.githubusercontent.com/52392004/235279107-3ef4ea2e-6e6d-4994-9b29-6bb6ad200157.png)

이제 cdk로 인프라를 설치합니다. 

```java
cdk deploy
```

실행이 되면 아래와 같이 Output을 확인할 수 있습니다.

![image](https://user-images.githubusercontent.com/52392004/235280195-66f9f76a-cbfb-4f72-812b-229f3cf284b1.png)

```java
Outputs:
CdkImageRecommenderStack.CopyCommend = aws s3 cp ../data/ s3://cdkimagerecommenderstack-imagerecommenderstorageb-1t32yos4phxfc/ --recursive
CdkImageRecommenderStack.Enabler = https://d2nnqu1h4mrgxo.cloudfront.net/enabler.html
CdkImageRecommenderStack.Gallery = https://d2nnqu1h4mrgxo.cloudfront.net/gallery.html
CdkImageRecommenderStack.ImageGenerator = https://d2nnqu1h4mrgxo.cloudfront.net/imgGenerator.html
CdkImageRecommenderStack.Preview = https://d2nnqu1h4mrgxo.cloudfront.net/preview.html
CdkImageRecommenderStack.apiUrlimagerecommender = https://auor8rwkm7.execute-api.ap-northeast-2.amazonaws.com/dev/
CdkImageRecommenderStack.apiimagerecommenderEndpointBCEFCEF0 = https://auor8rwkm7.execute-api.ap-northeast-2.amazonaws.com/dev/
CdkImageRecommenderStack.distributionDomainNameimagerecommender = d2nnqu1h4mrgxo.cloudfront.net
CdkImageRecommenderStack.galleryWebUrl = https://d2nnqu1h4mrgxo.cloudfront.net/gallery.html
```

여기서, "CopyCommend"을 터미널에서 실행하여 html로 만든 툴들을 복사합니다.

```java
aws s3 cp ../data/ s3://cdkimagerecommenderstack-imagerecommenderstorageb-1t32yos4phxfc/ --recursive
```


