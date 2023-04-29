# 감성 이미지 추천

여기서는 사용자의 감정에 따라 이미지를 추천하는 시스템 아키텍처를 소개합니다. 

이 프로젝트는 생성 AI(Generative AI)로 생성된 이미지를 감성 추천하는 시스템의 데모입니다. Stable Diffision은 생성 AI(Generative AI)에서 텍스트로 이미지를 생성하는 기초 모델 (Foundation Model)입니다. 여기에서는 Stable Diffusion으로 생성된 이미지를 감정(emotion)에 따라 추천하는 시스템을 생성하는 방법에 대해 설명합니다.

![image](https://user-images.githubusercontent.com/52392004/233784271-75654db5-b939-4de4-a369-a0998f859156.png)

주요 단계는 아래와 같습니다.

1) Amazon SageMaker의 JumpStart에서 제공하는 Stable Diffusion 모델을 이용하여 다수의 이미지를 생성합니다.
2) 생성된 이미지에서 적합한 이미지 선택합니다.
3) 생성된 이미지를 실제 제공하기 위하여 CloudFront와 연결된 S3로 이동시킵니다.
4) Amazon Personalize에서 사용할 수 있도록 user, item, interaction 데이터셋을 생성합니다.
5) 생성된 데이터로 Solution, Campaign을 생성합니다.
6) 클라이언트를 이용하여 감성기반의 이미지 추천을 활용합니다.

## SageMaker JumpStart로 Stable Diffusion 설치

[Stable Diffusion 인프라 설치](./stable-diffusion-deployment.md)를 참조하여 Stable Diffusion을 위한 SageMaker Endpoint를 생성합니다. 

## Cloud9로 인프라 설치

[Cloud9로 인프라 설치](./deployment.md)을 참조하여 인프라를 설치합니다.

## 이미지 생성

![image](https://user-images.githubusercontent.com/52392004/233811634-8116f361-d2c7-40f2-9d20-97dff8e00811.png)

Output의 copy 명령어를 이용해 tools를 설치합니다.

```java
aws s3 cp ../tools/ s3://emotion-gallery/tools --recursive
```

### Image Generator로 이미지 생성하기 

image generator를 실행합니다.

```java
https://d14j04tdmh4c1d.cloudfront.net/tools/imgGenerator/imgGenerator.html
```

Preview를 이용하여 이미지를 확인후 적절한 이미지를 선택합니다.

```java
https://d14j04tdmh4c1d.cloudfront.net/tools/preview/preview.html
```

### Reference 이미지 업로드하기

실습을 위해 Reference 이미지를 업로드 합니다. 

```java
aws s3 cp emotions/ s3://emotion-gallery/emotions/ --recursive
```

### 데이터 만들기

#### Enabler 사용 준비

Personalize는 최소 25명 이상의 user와 최소 1000개 이상의 interaction 데이터가 있어야 합니다. 따라서 gallery에서 이미지를 보여주기 위해서는 먼저 최소한의 Traning Dateset을 준비하여야 합니다. 이를 위해 여기서는 Enabler를 이용하여 데이터를 수집합니다. Enabler는 DynamoDB에서 item 정보를 가져와서 감정에 따라 보여주고, 사용자읜 선호를 like로 수집합니다.

Enabler 실행하기 위해서는 아래와 같이 "tools/enabler" 폴더를 CloudFront와 연결된 S3 Bucket의 루트로 복사합니다.

```java
aws s3 cp ../tools/enabler/ s3://emotion-gallery/ --recursive 
```

#### Event trackers 생성

실시간으로 User와 Interaction 데이터의 수집하기 위해서는 Event Tracker를 생성하여야 합니다. 따라서, 아래와 같이 Personalize의 Event trackers를 준비하고, 생성된 Event Tracker의  Tracking ID 정보를 소스 코드에 반영합니다. 

[Amazon Personalize]  - [Dataset groups] - [emotion-gallery-dataset] - [Event trackers]로 진입하여 [Configure tracker]에서 아래와 같이 [Tracker name]으로 "emotion-gallery-tracker"라고 입력후 [Next]를 선택합니다. 

![noname](https://user-images.githubusercontent.com/52392004/233830033-8f6a929d-a8b3-4661-8b72-194338ef40ac.png)

이때 "Tracking ID"는 아래와 같이 "5f493dca-a7da-4e40-bda4-05e697c70bf6"임을 알 수 있습니다.

![noname](https://user-images.githubusercontent.com/52392004/233830521-1f03e080-8b63-4fff-b6c8-90c2ca489b1f.png)

다시 Cloud9의 "emotion-gallery/cdk-emotion-gallery/lib/cdk-emotion-gallery-stack.ts"에서 아래와 같이 trackingId을 업데이트 합니다.

![noname](https://user-images.githubusercontent.com/52392004/233830607-d34ff721-7fbc-46a7-97b6-c10c29a9b5a2.png)

#### Enabler를 이용한 User, Interaction 데이터 수집

아래 경로로 진입하여 Recommendation을 위한 기본 Dataset을 생성합니다. 

```java
https://d14j04tdmh4c1d.cloudfront.net/enabler.html
```

